ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'QA';

ALTER TABLE "User"
ADD COLUMN "roles" "Role"[] NOT NULL DEFAULT ARRAY[]::"Role"[];

UPDATE "User"
SET "roles" = ARRAY["role"]::"Role"[];
