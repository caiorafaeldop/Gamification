/*
  Warnings:

  - A unique constraint covering the columns `[taskId,userId,type]` on the table `TaskAssignee` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TaskAssignee_taskId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignee_taskId_userId_type_key" ON "TaskAssignee"("taskId", "userId", "type");
