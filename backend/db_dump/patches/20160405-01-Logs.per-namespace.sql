ALTER TABLE "Logs"
DROP CONSTRAINT "Logs_user_fkey",
ALTER COLUMN "user" DROP NOT NULL;
ALTER TABLE "Logs" RENAME "user" TO "userid";