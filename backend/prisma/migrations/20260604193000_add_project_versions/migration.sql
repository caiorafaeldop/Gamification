-- CreateEnum
CREATE TYPE "ProjectVersionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'LOCKED', 'RELEASED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "ProjectVersion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectVersionStatus" NOT NULL DEFAULT 'PLANNED',
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "versionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVersion_projectId_name_key" ON "ProjectVersion"("projectId", "name");

-- CreateIndex
CREATE INDEX "ProjectVersion_projectId_status_idx" ON "ProjectVersion"("projectId", "status");

-- CreateIndex
CREATE INDEX "ProjectVersion_projectId_dueDate_idx" ON "ProjectVersion"("projectId", "dueDate");

-- CreateIndex
CREATE INDEX "Task_projectId_versionId_idx" ON "Task"("projectId", "versionId");

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ProjectVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
