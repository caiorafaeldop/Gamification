-- Reformulate Visibility enum + add ProjectLike + add likeCount + add JobPosting
-- Defensive style: idempotent operations (IF NOT EXISTS, DO blocks) so re-runs are safe.
-- IMPORTANT: PUBLIC values are remapped to PUBLIC_LIKE during the enum transition (no data loss).

------------------------------------------------------------
-- 1. JobPostingStatus enum
------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JobPostingStatus') THEN
    CREATE TYPE "JobPostingStatus" AS ENUM ('OPEN', 'CLOSED', 'FILLED');
  END IF;
END $$;

------------------------------------------------------------
-- 2. Visibility enum migration: PUBLIC -> PUBLIC_LIKE, plus PUBLIC_VIEW added.
--    Skipped entirely if already migrated (Visibility already has PUBLIC_LIKE).
------------------------------------------------------------
DO $$
DECLARE
  has_public_like BOOLEAN;
  has_public BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Visibility' AND e.enumlabel = 'PUBLIC_LIKE'
  ) INTO has_public_like;

  SELECT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Visibility' AND e.enumlabel = 'PUBLIC'
  ) INTO has_public;

  IF NOT has_public_like THEN
    CREATE TYPE "Visibility_new" AS ENUM ('PRIVATE', 'PUBLIC_VIEW', 'PUBLIC_LIKE');

    -- Drop default before changing column type (Prisma-style)
    ALTER TABLE "Project" ALTER COLUMN "visibility" DROP DEFAULT;

    -- Cast with explicit mapping: PUBLIC -> PUBLIC_LIKE, PRIVATE -> PRIVATE
    ALTER TABLE "Project" ALTER COLUMN "visibility" TYPE "Visibility_new"
      USING (
        CASE "visibility"::text
          WHEN 'PUBLIC' THEN 'PUBLIC_LIKE'::"Visibility_new"
          WHEN 'PRIVATE' THEN 'PRIVATE'::"Visibility_new"
          ELSE 'PUBLIC_LIKE'::"Visibility_new"
        END
      );

    ALTER TYPE "Visibility" RENAME TO "Visibility_old";
    ALTER TYPE "Visibility_new" RENAME TO "Visibility";
    DROP TYPE "Visibility_old";

    ALTER TABLE "Project" ALTER COLUMN "visibility" SET DEFAULT 'PUBLIC_LIKE';
  END IF;
END $$;

------------------------------------------------------------
-- 3. likeCount column on Project
------------------------------------------------------------
ALTER TABLE "Project"
ADD COLUMN IF NOT EXISTS "likeCount" INTEGER NOT NULL DEFAULT 0;

------------------------------------------------------------
-- 4. ProjectLike table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ProjectLike" (
  "userId"    TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectLike_pkey" PRIMARY KEY ("userId", "projectId")
);

CREATE INDEX IF NOT EXISTS "ProjectLike_projectId_createdAt_idx"
  ON "ProjectLike"("projectId", "createdAt");

CREATE INDEX IF NOT EXISTS "ProjectLike_createdAt_idx"
  ON "ProjectLike"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProjectLike_userId_fkey'
  ) THEN
    ALTER TABLE "ProjectLike"
      ADD CONSTRAINT "ProjectLike_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProjectLike_projectId_fkey'
  ) THEN
    ALTER TABLE "ProjectLike"
      ADD CONSTRAINT "ProjectLike_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "Project"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

------------------------------------------------------------
-- 5. JobPosting table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "JobPosting" (
  "id"          TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "contact"     TEXT NOT NULL,
  "status"      "JobPostingStatus" NOT NULL DEFAULT 'OPEN',
  "authorId"    TEXT NOT NULL,
  "groupId"     TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JobPosting_status_createdAt_idx"
  ON "JobPosting"("status", "createdAt");

CREATE INDEX IF NOT EXISTS "JobPosting_groupId_idx"
  ON "JobPosting"("groupId");

CREATE INDEX IF NOT EXISTS "JobPosting_authorId_idx"
  ON "JobPosting"("authorId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'JobPosting_authorId_fkey'
  ) THEN
    ALTER TABLE "JobPosting"
      ADD CONSTRAINT "JobPosting_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'JobPosting_groupId_fkey'
  ) THEN
    ALTER TABLE "JobPosting"
      ADD CONSTRAINT "JobPosting_groupId_fkey"
      FOREIGN KEY ("groupId") REFERENCES "Group"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
