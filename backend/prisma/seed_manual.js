"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = require("dotenv");
const achievement_service_1 = require("../dist/services/achievement.service"); // Import the achievement service
(0, dotenv_1.config)(); // Load environment variables
const prisma = new client_1.PrismaClient();
const HASH_ROUNDS = 10;
async function main() {
    console.log("Start seeding...");
    // 1. Create Tiers
    const tiersData = [
        { name: "Novice", minPoints: 0, order: 1, icon: "👋" },
        { name: "Aspirant", minPoints: 100, order: 2, icon: "🌱" },
        { name: "Contributor", minPoints: 300, order: 3, icon: "✨" },
        { name: "Leader", minPoints: 600, order: 4, icon: "🌟" },
        { name: "Elite", minPoints: 1000, order: 5, icon: "🏆" },
        { name: "Phoenix", minPoints: 2000, order: 6, icon: "🔥" },
    ];
    const tiers = await Promise.all(tiersData.map((data) => prisma.tier.upsert({
        where: { name: data.name },
        update: {},
        create: data,
    })));
    console.log("Tiers created:", tiers.map((t) => t.name).join(", "));
    const noviceTier = tiers.find((t) => t.name === "Novice");
    const aspirantTier = tiers.find((t) => t.name === "Aspirant");
    const contributorTier = tiers.find((t) => t.name === "Contributor");
    const leaderTier = tiers.find((t) => t.name === "Leader");
    const phoenixTier = tiers.find((t) => t.name === "Phoenix");
    // 2. Create Users
    const password = await bcrypt_1.default.hash("password123", HASH_ROUNDS);
    const adminUser = await prisma.user.upsert({
        where: { email: "admin@connecta.com" },
        update: {},
        create: {
            name: "Admin User",
            email: "admin@connecta.com",
            passwordHash: password,
            role: client_1.Role.ADMIN,
            connectaPoints: 2500,
            tierId: phoenixTier.id, // Assign to highest tier for admin
            streakCurrent: 10,
            streakBest: 15,
        },
    });
    console.log("Admin user created:", adminUser.email);
    const leader1 = await prisma.user.upsert({
        where: { email: "leader1@connecta.com" },
        update: {},
        create: {
            name: "Alice Leader",
            email: "leader1@connecta.com",
            passwordHash: password,
            role: client_1.Role.LEADER,
            connectaPoints: 750,
            tierId: leaderTier.id,
            streakCurrent: 5,
            streakBest: 8,
        },
    });
    const leader2 = await prisma.user.upsert({
        where: { email: "leader2@connecta.com" },
        update: {},
        create: {
            name: "Bob Leader",
            email: "leader2@connecta.com",
            passwordHash: password,
            role: client_1.Role.LEADER,
            connectaPoints: 400,
            tierId: contributorTier.id,
            streakCurrent: 3,
            streakBest: 5,
        },
    });
    const leader3 = await prisma.user.upsert({
        where: { email: "leader3@connecta.com" },
        update: {},
        create: {
            name: "Charlie Leader",
            email: "leader3@connecta.com",
            passwordHash: password,
            role: client_1.Role.LEADER,
            connectaPoints: 150,
            tierId: aspirantTier.id,
            streakCurrent: 2,
            streakBest: 3,
        },
    });
    console.log("Leaders created:", leader1.email, leader2.email, leader3.email);
    const members = [];
    for (let i = 1; i <= 20; i++) {
        const member = await prisma.user.upsert({
            where: { email: `member${i}@connecta.com` },
            update: {},
            create: {
                name: `Member ${i}`,
                email: `member${i}@connecta.com`,
                passwordHash: password,
                role: client_1.Role.MEMBER,
                connectaPoints: Math.floor(Math.random() * 500), // Random points
                tierId: noviceTier.id, // Default to novice, will be recalculated
                streakCurrent: Math.floor(Math.random() * 5),
                streakBest: Math.floor(Math.random() * 10),
            },
        });
        members.push(member);
    }
    console.log("20 members created.");
    // 3. Create Teams
    const teamBackend = await prisma.team.upsert({
        where: { name: "Backend Development" },
        update: {},
        create: {
            name: "Backend Development",
            description: "Focus on API, database, and server logic.",
            focusArea: "Node.js, PostgreSQL, Prisma",
            leaderId: leader1.id,
            members: {
                create: [
                    { userId: leader1.id },
                    { userId: members[0].id },
                    { userId: members[1].id },
                    { userId: members[2].id },
                    { userId: members[3].id },
                    { userId: members[4].id },
                    { userId: members[5].id },
                    { userId: members[6].id },
                ],
            },
        },
    });
    const teamFrontend = await prisma.team.upsert({
        where: { name: "Frontend Development" },
        update: {},
        create: {
            name: "Frontend Development",
            description: "Building user interfaces and user experience.",
            focusArea: "React, TypeScript, Tailwind CSS",
            leaderId: leader2.id,
            members: {
                create: [
                    { userId: leader2.id },
                    { userId: members[7].id },
                    { userId: members[8].id },
                    { userId: members[9].id },
                    { userId: members[10].id },
                    { userId: members[11].id },
                    { userId: members[12].id },
                ],
            },
        },
    });
    const teamResearch = await prisma.team.upsert({
        where: { name: "Research & Innovation" },
        update: {},
        create: {
            name: "Research & Innovation",
            description: "Exploring new technologies and solutions.",
            focusArea: "AI, Machine Learning, Data Science",
            leaderId: leader3.id,
            members: {
                create: [
                    { userId: leader3.id },
                    { userId: members[13].id },
                    { userId: members[14].id },
                    { userId: members[15].id },
                    { userId: members[16].id },
                ],
            },
        },
    });
    console.log("Teams created:", teamBackend.name, teamFrontend.name, teamResearch.name);
    // 4. Create Sample Tasks
    const tasks = [
        {
            title: "Implement User Authentication",
            description: "Set up JWT, bcrypt, and auth routes.",
            status: client_1.TaskStatus.DONE,
            difficulty: client_1.TaskDifficulty.HARD,
            pointsReward: 40,
            teamId: teamBackend.id,
            createdById: leader1.id,
            assignedToId: members[0].id,
            dueDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
            tags: ["auth", "security"],
            requiredTierId: aspirantTier.id,
            completedAt: new Date(Date.now() - 86400000 * 1),
        },
        {
            title: "Design Dashboard UI",
            description: "Create wireframes and initial React components for the dashboard.",
            status: client_1.TaskStatus.REVIEW,
            difficulty: client_1.TaskDifficulty.MEDIUM,
            pointsReward: 20,
            teamId: teamFrontend.id,
            createdById: leader2.id,
            assignedToId: members[7].id,
            dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
            tags: ["ui", "design"],
            requiredTierId: noviceTier.id,
        },
        {
            title: "Research Gamification Strategies",
            description: "Explore different gamification models for student engagement.",
            status: client_1.TaskStatus.IN_PROGRESS,
            difficulty: client_1.TaskDifficulty.EASY,
            pointsReward: 10,
            teamId: teamResearch.id,
            createdById: leader3.id,
            assignedToId: members[13].id,
            dueDate: new Date(Date.now() + 86400000 * 5),
            tags: ["research", "gamification"],
            requiredTierId: noviceTier.id,
        },
        {
            title: "Set up Prisma ORM",
            description: "Configure Prisma with PostgreSQL and generate client.",
            status: client_1.TaskStatus.DONE,
            difficulty: client_1.TaskDifficulty.EASY,
            pointsReward: 10,
            teamId: teamBackend.id,
            createdById: leader1.id,
            assignedToId: members[1].id,
            dueDate: new Date(Date.now() - 86400000 * 5),
            tags: ["database", "prisma"],
            requiredTierId: noviceTier.id,
            completedAt: new Date(Date.now() - 86400000 * 4),
        },
        {
            title: "Develop Kanban Board Drag & Drop",
            description: "Implement drag and drop functionality for task cards.",
            status: client_1.TaskStatus.IN_PROGRESS,
            difficulty: client_1.TaskDifficulty.HARD,
            pointsReward: 40,
            teamId: teamFrontend.id,
            createdById: leader2.id,
            assignedToId: members[8].id,
            dueDate: new Date(Date.now() + 86400000 * 7),
            tags: ["kanban", "frontend"],
            requiredTierId: contributorTier.id,
        },
        {
            title: "Write API Documentation",
            description: "Document all backend API endpoints using Swagger/OpenAPI.",
            status: client_1.TaskStatus.BACKLOG,
            difficulty: client_1.TaskDifficulty.MEDIUM,
            pointsReward: 20,
            teamId: teamBackend.id,
            createdById: leader1.id,
            assignedToId: null,
            dueDate: new Date(Date.now() + 86400000 * 10),
            tags: ["documentation", "api"],
            requiredTierId: aspirantTier.id,
        },
    ];
    for (const taskData of tasks) {
        await prisma.task.upsert({
            where: { id: taskData.title.replace(/\s/g, "-").toLowerCase() }, // Simple unique identifier for upsert
            update: {},
            create: taskData,
        });
    }
    console.log("Sample tasks created.");
    // 5. Create Sample ActivityLog entries
    await prisma.activityLog.createMany({
        data: [
            {
                userId: adminUser.id,
                type: client_1.ActivityType.POINTS_ADJUSTED,
                description: "Initial points set for admin.",
                pointsChange: 2500,
            },
            {
                userId: members[0].id,
                type: client_1.ActivityType.TASK_COMPLETED,
                description: `Completed task: 'Implement User Authentication'`,
                pointsChange: 40,
            },
            {
                userId: members[0].id,
                type: client_1.ActivityType.TIER_ACHIEVED,
                description: `Achieved tier: ${aspirantTier.name}`,
            },
            {
                userId: members[1].id,
                type: client_1.ActivityType.TASK_COMPLETED,
                description: `Completed task: 'Set up Prisma ORM'`,
                pointsChange: 10,
            },
            {
                userId: leader1.id,
                type: client_1.ActivityType.TASK_CREATED,
                description: `Created task: 'Implement User Authentication'`,
            },
            {
                userId: leader2.id,
                type: client_1.ActivityType.TASK_CREATED,
                description: `Created task: 'Design Dashboard UI'`,
            },
        ],
    });
    console.log("Sample activity logs created.");
    // 6. Create Achievements
    const achievementsData = [
        { name: "First Step", description: "Complete your first task.", icon: "🚶", criteria: "tasks completed 1" },
        { name: "Aspirant Achiever", description: "Reach 100 Connecta Points.", icon: "🌱", criteria: "points 100" },
        { name: "Streak Starter", description: "Maintain a 3-day streak.", icon: "⚡", criteria: "streak 3" },
        { name: "Task Master", description: "Complete 10 tasks.", icon: "✅", criteria: "tasks completed 10" },
        { name: "Connecta Contributor", description: "Reach 300 Connecta Points.", icon: "✨", criteria: "points 300" },
        { name: "Team Player", description: "Join a team.", icon: "🤝", criteria: "joined team" }, // This criteria needs more specific logic in checkAndAwardAchievements
    ];
    const achievements = await Promise.all(achievementsData.map((data) => prisma.achievement.upsert({
        where: { name: data.name },
        update: {},
        create: data,
    })));
    console.log("Achievements created:", achievements.map((a) => a.name).join(", ")); // Adicionado tipo explícito para 'a'
    // Recalculate tiers for all users after initial points and tasks
    // This would typically be handled by the gamification service, but for seed, we can do it manually
    const allUsers = await prisma.user.findMany({ include: { tier: true } });
    for (const user of allUsers) {
        const currentTier = tiers.find((t) => t.id === user.tierId);
        if (!currentTier || user.connectaPoints < currentTier.minPoints) {
            const newTier = tiers
                .filter((t) => user.connectaPoints >= t.minPoints)
                .sort((a, b) => b.order - a.order)[0] || noviceTier;
            if (newTier.id !== user.tierId) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { tierId: newTier.id },
                });
                console.log(`User ${user.name} (ID: ${user.id}) tier updated to ${newTier.name}`);
            }
        }
        // After updating user data, check for achievements
        await prisma.$transaction(async (tx) => {
            await (0, achievement_service_1.checkAndAwardAchievements)(user.id, tx);
        });
    }
    console.log("Seeding finished.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
