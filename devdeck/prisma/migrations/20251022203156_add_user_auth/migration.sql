/*
  Warnings:

  - You are about to drop the column `type` on the `boards` table. All the data in the column will be lost.
  - Added the required column `userId` to the `boards` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- DropIndex
DROP INDEX "boards_name_key";

-- AlterTable
ALTER TABLE "boards" DROP COLUMN "type";
ALTER TABLE "boards" ADD COLUMN "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "boards_name_userId_key" ON "boards"("name", "userId");

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
