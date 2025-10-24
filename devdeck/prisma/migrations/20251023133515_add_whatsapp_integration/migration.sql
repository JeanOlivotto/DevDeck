-- AlterTable
ALTER TABLE "users" ADD COLUMN "whatsappNumber" TEXT;
ALTER TABLE "users" ADD COLUMN "notifyViaWhatsApp" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "whatsappSession" TEXT;
