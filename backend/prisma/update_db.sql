-- 1. Criar Enums necessários
CREATE TYPE "GroupRole" AS ENUM ('ADMIN', 'MEMBER');
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "TaskComplexity" AS ENUM ('TRIVIAL', 'REGULAR', 'COMPLEX', 'EPIC');

-- 2. Criar a Tabela de Grupos
CREATE TABLE "Group" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#38bdf8',
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "totalXp" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar Tabela de Membros do Grupo
CREATE TABLE "GroupMember" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "role" "GroupRole" DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId", "groupId"),
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE
);

-- 4. Atualizar Tabela de Projetos (Visibilidade e Vínculo com Grupo)
ALTER TABLE "Project" ADD COLUMN "groupId" TEXT;
ALTER TABLE "Project" ADD COLUMN "isJoiningOpen" BOOLEAN DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "visibility" "Visibility" DEFAULT 'PUBLIC';
ALTER TABLE "Project" ADD CONSTRAINT "Project_groupId_fkey" 
    FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL;

-- 5. Atualizar Tabela de Tarefas (Complexidade Padronizada)
ALTER TABLE "Task" ADD COLUMN "complexity" "TaskComplexity" DEFAULT 'REGULAR';
