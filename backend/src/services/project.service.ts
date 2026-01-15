import { Prisma, Project, Role, ActivityType } from '@prisma/client';
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

    const project = await createProject({
      title: data.title,
      description: data.description,
      category: data.category,
      color: data.color,
      status: data.status,
      xpReward: data.xpReward,
      progress: data.progress || 0,
      coverUrl: data.coverUrl,
      leader: { connect: { id: data.leaderId } },
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
    const updatedProject = await updateProject(id, data, tx);
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

export const deleteProjectById = async (id: string, adminId: string) => {
  const project = await findProjectById(id);
  if (!project) {
    throw { statusCode: 404, message: 'Project not found.' };
  }

  return prisma.$transaction(async (tx) => {
    await deleteProject(id);
    await createActivityLog({
      user: { connect: { id: adminId } },
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