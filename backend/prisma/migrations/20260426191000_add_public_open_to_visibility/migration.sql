-- Add PUBLIC_OPEN to Visibility enum (only if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Visibility' AND e.enumlabel = 'PUBLIC_OPEN'
  ) THEN
    ALTER TYPE "Visibility" ADD VALUE 'PUBLIC_OPEN';
  END IF;
END$$;

-- Create ProjectJoinRequest table if not exists
CREATE TABLE IF NOT EXISTS "ProjectJoinRequest" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status"    "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectJoinRequest_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProjectJoinRequest_userId_projectId_key'
  ) THEN
    ALTER TABLE "ProjectJoinRequest" ADD CONSTRAINT "ProjectJoinRequest_userId_projectId_key" UNIQUE ("userId", "projectId");
  END IF;
END$$;

-- Add indexes if not exist
CREATE INDEX IF NOT EXISTS "ProjectJoinRequest_projectId_status_idx" ON "ProjectJoinRequest"("projectId", "status");

-- Add foreign keys if not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProjectJoinRequest_userId_fkey'
  ) THEN
    ALTER TABLE "ProjectJoinRequest" ADD CONSTRAINT "ProjectJoinRequest_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProjectJoinRequest_projectId_fkey'
  ) THEN
    ALTER TABLE "ProjectJoinRequest" ADD CONSTRAINT "ProjectJoinRequest_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;
