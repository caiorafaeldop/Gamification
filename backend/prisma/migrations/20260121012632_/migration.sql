-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "pointsPerCompletedTask" DROP NOT NULL,
ALTER COLUMN "pointsPerCompletedTask" SET DEFAULT 50,
ALTER COLUMN "pointsPerOpenTask" DROP NOT NULL;
