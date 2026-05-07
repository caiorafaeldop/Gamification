-- Create GroupCategory enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GroupCategory') THEN
    CREATE TYPE "GroupCategory" AS ENUM ('INSTITUCIONAL', 'COMUNIDADE', 'EXTERNO');
  END IF;
END$$;

-- Add category column to Group if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Group' AND column_name = 'category'
  ) THEN
    ALTER TABLE "Group" ADD COLUMN "category" "GroupCategory" NOT NULL DEFAULT 'COMUNIDADE';
  END IF;
END$$;
