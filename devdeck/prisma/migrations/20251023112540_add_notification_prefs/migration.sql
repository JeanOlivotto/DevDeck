-- AlterTable
ALTER TABLE "users" ADD COLUMN "notifyDailySummary" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "notifyStaleTasks" BOOLEAN NOT NULL DEFAULT true;
