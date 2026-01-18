-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_leaderId_fkey";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
