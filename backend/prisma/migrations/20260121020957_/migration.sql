/*
  Warnings:

  - Added the required column `type` to the `TaskAssignee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssigneeType" AS ENUM ('CREATOR', 'IMPLEMENTER', 'REVIEWER');

-- AlterTable
ALTER TABLE "TaskAssignee" ADD COLUMN     "type" "AssigneeType" NOT NULL DEFAULT 'IMPLEMENTER';
ALTER TABLE "TaskAssignee" ALTER COLUMN "type" DROP DEFAULT;
