import { Prisma, Project, Role, ActivityType, GroupRole } from '@prisma/client';
import { createProject, findProjectById, findProjects, updateProject, deleteProject, addProjectMember, removeProjectMember, isUserProjectMember } from '../repositories/project.repository';
import { findUserById, updateUser } from '../repositories/user.repository';
import { createActivityLog } from '../repositories/activityLog.repository';
import { CreateProjectInput, UpdateProjectInput, AddProjectMemberInput } from '../schemas/project.schema';
import { checkAndAwardAchievements } from './achievement.service';
import prisma from '../utils/prisma';

export const createNewProject = async (data: CreateProjectInput, creatorId: string) => {
  const leader = await findUserById(data.leaderId);
  if (!leader) {
    throw { statusCode: 404, message: 'Leader not found.' };
  }
  if (leader.role === Role.MEMBER) {
    await updateUser(leader.id, { role: Role.LEADER });
  }

  const createdProject = await prisma.$transaction(async (tx) => {
    const uniqueMemberIds = new Set(data.memberIds || []);
    uniqueMemberIds.add(data.leaderId);

    const groupId = (data as any).groupId as string | undefined;

    const project = await createProject({
      title: data.title,
      description: data.description,
      category: data.category,
      type: data.type,
      color: data.color,
      status: data.status as any,
      xpReward: data.xpReward,
      progress: data.progress || 0,
      coverUrl: data.coverUrl,
      visibility: (data as any).visibility || undefined,
      leader: { connect: { id: data.leaderId } },
      ...(groupId ? { Group: { connect: { id: groupId } } } : {}),
      members: {
        create: Array.from(uniqueMemberIds).map(userId => ({ userId })),
      },
    }, tx);

    await createActivityLog({
      user: { connect: { id: creatorId } },
      type: ActivityType.PROJECT_CREATED,
      description: `Created project "${project.title}" with ${leader.name} as leader.`,
    }, tx);

    return project;
  });

  // Check achievements after transaction commits
  const uniqueMemberIdsForAchievements = new Set(data.memberIds || []);
  uniqueMemberIdsForAchievements.add(data.leaderId);
  for (const memberId of Array.from(uniqueMemberIdsForAchievements)) {
    console.log(`[TRIGGER] Project creator/member added, checking achievements for ${memberId} (Async)`);
    checkAndAwardAchievements(memberId).catch(err => console.error("Achievement check failed:", err));
  }

  return createdProject;
};

export const getProjectDetails = async (id: string) => {
  const project = await findProjectById(id);
  if (!project) {
    throw { statusCode: 404, message: 'Project not found.' };
  }
  return project;
};

export const getAllProjects = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const projects = await findProjects({
    skip,
    take: limit,
    orderBy: { title: 'asc' },
  });
  const total = await prisma.project.count();
  return { projects, total, page, limit };
};

export const updateProjectDetails = async (id: string, data: UpdateProjectInput, requestingUserId: string, requestingUserRole: Role) => {
  const project = await findProjectById(id);
  if (!project) {
    throw { statusCode: 404, message: 'Project not found.' };
  }

  if (requestingUserRole !== Role.ADMIN && project.leaderId !== requestingUserId) {
    throw { statusCode: 403, message: 'Only the project leader or an admin can update this project.' };
  }

  if (data.leaderId && data.leaderId !== project.leaderId) {
    const newLeader = await findUserById(data.leaderId);
    if (!newLeader) {
      throw { statusCode: 404, message: 'New leader not found.' };
    }
    const isMember = await isUserProjectMember(id, newLeader.id);
    if (!isMember) {
      await addProjectMember(id, newLeader.id);
      await createActivityLog({
        user: { connect: { id: newLeader.id } },
        type: ActivityType.USER_JOINED_PROJECT,
        description: `Joined project "${project.title}".`,
      });
    }
    if (newLeader.role === Role.MEMBER) {
      await updateUser(newLeader.id, { role: Role.LEADER });
    }
  }

  const updatedProjectResult = await prisma.$transaction(async (tx) => {
    // PONTUAÇÃO RETROATIVA: Se pontosPerCompletedTask mudou, recalcular para tasks concluídas
    const oldPointsPerCompleted = (project as any).pointsPerCompletedTask ?? 100;
    const newPointsPerCompleted = (data as any).pointsPerCompletedTask;

    if (newPointsPerCompleted !== undefined && newPointsPerCompleted !== oldPointsPerCompleted) {
      const pointsDifference = newPointsPerCompleted - oldPointsPerCompleted;

      // Buscar todas as tasks concluídas do projeto com seus assignees
      const completedTasks = await tx.task.findMany({
        where: {
          projectId: id,
          completedAt: { not: null }
        },
        include: {
          assignees: { include: { user: { select: { id: true } } } }
        }
      });

      console.log(`[RETROACTIVE] Points changed from ${oldPointsPerCompleted} to ${newPointsPerCompleted}. Difference: ${pointsDifference}. Found ${completedTasks.length} completed tasks.`);

      // Para cada task concluída, ajustar pontos de todos os assignees
      for (const task of completedTasks) {
        const assigneeIds = task.assignees.map(a => a.user.id);

        for (const userId of assigneeIds) {
          // Ajustar pontuação do usuário diretamente
          await tx.user.update({
            where: { id: userId },
            data: { connectaPoints: { increment: pointsDifference } }
          });
          console.log(`[RETROACTIVE] Adjusted ${pointsDifference} points for user ${userId} (task ${task.id})`);
        }
      }
    }

    const updatedProject = await updateProject(id, data as any, tx);
    return updatedProject;
  });

  // Check achievements after transaction commits
  if (data.progress === 100) {
    console.log(`[TRIGGER] Project completed, checking achievements for all members of ${id} (Async)`);
    prisma.projectMember.findMany({ where: { projectId: id } })
      .then(members => {
        members.forEach(member => checkAndAwardAchievements(member.userId).catch(err => console.error(err)));
      });
  } else if (requestingUserId) {
    console.log(`[TRIGGER] Project updated, checking achievements for requester ${requestingUserId} (Async)`);
    checkAndAwardAchievements(requestingUserId).catch(err => console.error(err));
  }

  return updatedProjectResult;
};

export const deleteProjectById = async (id: string, requestId: string) => {
  const project = await findProjectById(id);
  if (!project) {
    throw { statusCode: 404, message: 'Project not found.' };
  }

  // Permission check: Only leader or admin
  const user = await findUserById(requestId);
  if (!user) {
    throw { statusCode: 404, message: 'User not found.' };
  }

  if (user.role !== Role.ADMIN && project.leaderId !== requestId) {
    throw { statusCode: 403, message: 'Only the project leader or an admin can delete this project.' };
  }

  return prisma.$transaction(async (tx) => {
    await deleteProject(id);
    await createActivityLog({
      user: { connect: { id: requestId } },
      type: ActivityType.PROJECT_DELETED,
      description: `Deleted project "${project.title}".`,
    }, tx);
    return project;
  });
};

export const addMemberToProject = async (projectId: string, data: AddProjectMemberInput, requestingUserId: string, requestingUserRole: Role) => {
  const project = await findProjectById(projectId);
  if (!project) {
    throw { statusCode: 404, message: 'Project not found.' };
  }

  if (requestingUserRole !== Role.ADMIN && project.leaderId !== requestingUserId && requestingUserId !== data.userId) {
    throw { statusCode: 403, message: 'Only the project leader or an admin can add members to this project.' };
  }

  const user = await findUserById(data.userId);
  if (!user) {
    throw { statusCode: 404, message: 'User not found.' };
  }

  const isMember = await isUserProjectMember(projectId, data.userId);
  if (isMember) {
    throw { statusCode: 409, message: 'User is already a member of this project.' };
  }

  const resultMember = await prisma.$transaction(async (tx) => {
    const projectMember = await addProjectMember(projectId, data.userId, tx);
    await createActivityLog({
      user: { connect: { id: data.userId } },
      type: ActivityType.USER_JOINED_PROJECT,
      description: `Joined project "${project.title}".`,
    }, tx);
    return projectMember;
  });

  console.log(`[TRIGGER] Member added, checking achievements for ${data.userId} (Async)`);
  checkAndAwardAchievements(data.userId).catch(err => console.error("Achievement check failed:", err));

  return resultMember;
};

export const removeMemberFromProject = async (projectId: string, userId: string, requestingUserId: string, requestingUserRole: Role) => {
  const project = await findProjectById(projectId);
  if (!project) {
    throw { statusCode: 404, message: 'Project not found.' };
  }

  if (requestingUserRole !== Role.ADMIN && project.leaderId !== requestingUserId) {
    throw { statusCode: 403, message: 'Only the project leader or an admin can remove members from this project.' };
  }

  return prisma.$transaction(async (tx) => {
    const isMember = await isUserProjectMember(projectId, userId, tx);
    if (!isMember) {
      throw { statusCode: 404, message: 'User is not a member of this project.' };
    }
    const projectMember = await removeProjectMember(projectId, userId, tx);
    await createActivityLog({
      user: { connect: { id: userId } },
      type: ActivityType.USER_LEFT_PROJECT,
      description: `Left project "${project.title}".`,
    }, tx);
    return projectMember;
  });
};

// Exporting leaveProject safely
export const leaveProject = async (projectId: string, userId: string) => {
  console.log('[SERVICE] leaveProject called');
  const project = await findProjectById(projectId);
  if (!project) {
    throw { statusCode: 404, message: 'Project not found.' };
  }

  // Ensure user is actually a member
  const isMember = await isUserProjectMember(projectId, userId);
  if (!isMember) {
    throw { statusCode: 400, message: 'You are not a member of this project.' };
  }

  // Prevent leader from leaving without transferring ownership
  if (project.leaderId === userId) {
    throw { statusCode: 403, message: 'Project leaders cannot leave the project without transferring ownership first.' };
  }

  return prisma.$transaction(async (tx) => {
    const projectMember = await removeProjectMember(projectId, userId, tx);
    await createActivityLog({
      user: { connect: { id: userId } },
      type: ActivityType.USER_LEFT_PROJECT,
      description: `Left project "${project.title}".`,
    }, tx);
    return projectMember;
  });
};



export const registerInterestInProject = async (projectId: string, userId: string) => {
  return requestJoinProject(projectId, userId);
};

export const requestJoinProject = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      visibility: true,
      leaderId: true,
      groupId: true,
      Group: { select: { id: true, name: true, isRestricted: true } },
    },
  });
  if (!project) {
    throw { statusCode: 404, message: 'Projeto não encontrado.' };
  }

  if (project.visibility === 'PRIVATE') {
    throw { statusCode: 403, message: 'Este projeto é privado.' };
  }

  if (project.leaderId === userId) {
    throw { statusCode: 409, message: 'Você é o líder deste projeto.' };
  }

  const alreadyMember = await isUserProjectMember(projectId, userId);
  if (alreadyMember) {
    throw { statusCode: 409, message: 'Você já participa deste projeto.' };
  }

  const interested = await findUserById(userId);
  if (!interested) {
    throw { statusCode: 404, message: 'Usuário não encontrado.' };
  }

  if (!project.groupId || !project.Group) {
    throw { statusCode: 400, message: 'Este projeto não está vinculado a um grupo.' };
  }

  const groupId = project.groupId;
  const group = project.Group;
  const isGroupMember = !!(await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  }));

  // CASE A — PUBLIC_OPEN: instant join (group + project)
  if ((project.visibility as string) === 'PUBLIC_OPEN') {
    await prisma.$transaction(async (tx) => {
      if (!isGroupMember) {
        await tx.groupMember.create({
          data: { userId, groupId, role: GroupRole.MEMBER },
        });
      }
      await tx.projectMember.create({
        data: { userId, projectId },
      });
      await createActivityLog({
        user: { connect: { id: userId } },
        type: ActivityType.USER_JOINED_PROJECT,
        description: `Joined project "${project.title}".`,
      }, tx);
    });

    checkAndAwardAchievements(userId).catch((err) => console.error('Achievement check failed:', err));

    return {
      status: 'joined' as const,
      joinedGroup: !isGroupMember,
      joinedProject: true,
      message: isGroupMember
        ? `Você entrou no projeto "${project.title}".`
        : `Você entrou no grupo "${group.name}" e no projeto "${project.title}".`,
    };
  }

  // CASE B — PUBLIC (PUBLIC_LIKE / PUBLIC_VIEW): request flow

  // Sub-case B3 — not a group member, group restricted: request to JOIN THE GROUP
  if (!isGroupMember && group.isRestricted) {
    const existing = await prisma.groupJoinRequest.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (existing && existing.status === 'PENDING') {
      throw {
        statusCode: 409,
        message: `Você já tem uma solicitação pendente para entrar no grupo "${group.name}".`,
      };
    }
    if (existing) {
      await prisma.groupJoinRequest.update({
        where: { userId_groupId: { userId, groupId } },
        data: { status: 'PENDING', updatedAt: new Date() },
      });
    } else {
      await prisma.groupJoinRequest.create({ data: { userId, groupId } });
    }

    return {
      status: 'group-request-sent' as const,
      message: `Este grupo é restrito. Sua solicitação foi enviada para entrar no grupo "${group.name}". Quando aprovada, você poderá pedir para entrar no projeto.`,
    };
  }

  // Sub-case B2 — not a group member, group is open: auto-join group, then request to join project
  if (!isGroupMember && !group.isRestricted) {
    await prisma.groupMember.create({
      data: { userId, groupId, role: GroupRole.MEMBER },
    });
  }

  // Sub-case B1 / B2 continued — create or refresh ProjectJoinRequest
  const existingProjectRequest = await (prisma as any).projectJoinRequest.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (existingProjectRequest && existingProjectRequest.status === 'PENDING') {
    throw {
      statusCode: 409,
      message: 'Você já tem uma solicitação pendente para este projeto.',
    };
  }

  const projectRequest = existingProjectRequest
    ? await (prisma as any).projectJoinRequest.update({
        where: { userId_projectId: { userId, projectId } },
        data: { status: 'PENDING', updatedAt: new Date() },
      })
    : await (prisma as any).projectJoinRequest.create({
        data: { userId, projectId },
      });

  // Notify all current project members
  const projectMembers = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });
  const recipientIds = new Set<string>(projectMembers.map((m) => m.userId));
  recipientIds.add(project.leaderId);
  recipientIds.delete(userId);

  if (recipientIds.size > 0) {
    await prisma.notification.createMany({
      data: Array.from(recipientIds).map((rid) => ({
        userId: rid,
        title: 'Nova solicitação para entrar no projeto',
        message: `${interested.name} solicitou entrada no projeto "${project.title}".`,
        type: 'PROJECT_JOIN_REQUEST',
      })),
    });
  }

  const joinedGroupNow = !isGroupMember && !group.isRestricted;

  return {
    status: 'project-request-sent' as const,
    joinedGroup: joinedGroupNow,
    requestId: projectRequest.id,
    message: joinedGroupNow
      ? `Você entrou no grupo "${group.name}". Sua solicitação foi enviada aos membros do projeto para aprovação.`
      : `Solicitação enviada aos membros do projeto "${project.title}".`,
  };
};

export const listProjectJoinRequests = async (projectId: string, requestingUserId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, leaderId: true },
  });
  if (!project) throw { statusCode: 404, message: 'Projeto não encontrado.' };

  const isMember = await isUserProjectMember(projectId, requestingUserId);
  if (!isMember && project.leaderId !== requestingUserId) {
    throw { statusCode: 403, message: 'Apenas membros do projeto podem ver solicitações.' };
  }

  return (prisma as any).projectJoinRequest.findMany({
    where: { projectId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, avatarColor: true } },
    },
  });
};

export const respondToProjectJoinRequest = async (
  requestId: string,
  action: 'APPROVED' | 'REJECTED',
  requestingUserId: string,
) => {
  const joinRequest = await (prisma as any).projectJoinRequest.findUnique({
    where: { id: requestId },
    include: { project: { select: { id: true, title: true, leaderId: true } } },
  });
  if (!joinRequest) throw { statusCode: 404, message: 'Solicitação não encontrada.' };
  if (joinRequest.status !== 'PENDING') {
    throw { statusCode: 400, message: 'Esta solicitação já foi processada.' };
  }

  const isMember = await isUserProjectMember(joinRequest.projectId, requestingUserId);
  const isLeader = joinRequest.project.leaderId === requestingUserId;
  if (!isMember && !isLeader) {
    throw { statusCode: 403, message: 'Apenas membros do projeto podem responder a solicitações.' };
  }

  return prisma.$transaction(async (tx) => {
    const updated = await (tx as any).projectJoinRequest.update({
      where: { id: requestId },
      data: { status: action, updatedAt: new Date() },
    });

    if (action === 'APPROVED') {
      const alreadyMember = await tx.projectMember.findUnique({
        where: {
          userId_projectId: { userId: joinRequest.userId, projectId: joinRequest.projectId },
        },
      });
      if (!alreadyMember) {
        await tx.projectMember.create({
          data: { userId: joinRequest.userId, projectId: joinRequest.projectId },
        });
        await createActivityLog({
          user: { connect: { id: joinRequest.userId } },
          type: ActivityType.USER_JOINED_PROJECT,
          description: `Joined project "${joinRequest.project.title}".`,
        }, tx);
      }

      await tx.notification.create({
        data: {
          userId: joinRequest.userId,
          title: 'Sua solicitação foi aprovada',
          message: `Você agora é membro do projeto "${joinRequest.project.title}".`,
          type: 'PROJECT_JOIN_APPROVED',
        },
      });
    } else {
      await tx.notification.create({
        data: {
          userId: joinRequest.userId,
          title: 'Sua solicitação foi recusada',
          message: `Sua solicitação para o projeto "${joinRequest.project.title}" foi recusada.`,
          type: 'PROJECT_JOIN_REJECTED',
        },
      });
    }

    return updated;
  });
};

export const transferProjectOwnership = async (projectId: string, newLeaderId: string, requestingUserId: string) => {
  const project = await findProjectById(projectId);
  if (!project) {
    throw { statusCode: 404, message: 'Project not found.' };
  }

  // Only current leader can transfer ownership
  if (project.leaderId !== requestingUserId) {
    throw { statusCode: 403, message: 'Only the project leader can transfer ownership.' };
  }

  // Cannot transfer to self
  if (newLeaderId === requestingUserId) {
    throw { statusCode: 400, message: 'You are already the leader of this project.' };
  }

  const newLeader = await findUserById(newLeaderId);
  if (!newLeader) {
    throw { statusCode: 404, message: 'New leader not found.' };
  }

  // Ensure new leader is a member of the project
  const isMember = await isUserProjectMember(projectId, newLeaderId);
  if (!isMember) {
    throw { statusCode: 400, message: 'The new leader must be a member of the project.' };
  }

  return prisma.$transaction(async (tx) => {
    // Update project leader
    const updatedProject = await tx.project.update({
      where: { id: projectId },
      data: { leaderId: newLeaderId }
    });

    // If new leader was just a MEMBER, upgrade role to LEADER (optional depending on system design rules, 
    // assuming here that 'Role.LEADER' is a global role or just meaningful contextually. 
    // In this schema User.role seems global. If we want to keep it simple, we might just leave role as is 
    // or upgrade if they are simple MEMBER. 
    // Re-reading logic in createNewProject: "if (leader.role === Role.MEMBER) { await updateUser(leader.id, { role: Role.LEADER }); }"
    // So we should probably do the same here.
    if (newLeader.role === Role.MEMBER) {
      await tx.user.update({
        where: { id: newLeaderId },
        data: { role: Role.LEADER }
      });
    }

    // Log activity
    await createActivityLog({
      user: { connect: { id: requestingUserId } },
      type: ActivityType.ROLE_CHANGED,
      description: `Transferred leadership of project "${project.title}" to ${newLeader.name}.`,
    }, tx);

    await createActivityLog({
      user: { connect: { id: newLeaderId } },
      type: ActivityType.ROLE_CHANGED,
      description: `Became leader of project "${project.title}".`,
    }, tx);

    return updatedProject;
  });
};
