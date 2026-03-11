ALTER TABLE "ActivityLog"
ADD COLUMN IF NOT EXISTS "projectId" TEXT;

CREATE INDEX IF NOT EXISTS "ActivityLog_projectId_idx" ON "ActivityLog"("projectId");
CREATE INDEX IF NOT EXISTS "ActivityLog_userId_projectId_createdAt_idx" ON "ActivityLog"("userId", "projectId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ActivityLog_projectId_fkey'
  ) THEN
    ALTER TABLE "ActivityLog"
    ADD CONSTRAINT "ActivityLog_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
