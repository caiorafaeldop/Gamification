-- Add links column to JobPosting if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'JobPosting' AND column_name = 'links'
  ) THEN
    ALTER TABLE "JobPosting" ADD COLUMN "links" TEXT;
  END IF;
END$$;
