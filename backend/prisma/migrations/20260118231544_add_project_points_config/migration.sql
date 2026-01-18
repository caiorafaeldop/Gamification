-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "pointsPerCompletedTask" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "pointsPerOpenTask" INTEGER NOT NULL DEFAULT 50;
