-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "notifyViaWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    "whatsappSession" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "notifyDailySummary" BOOLEAN NOT NULL DEFAULT true,
    "notifyStaleTasks" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_users" ("createdAt", "email", "id", "name", "notifyDailySummary", "notifyStaleTasks", "password", "updatedAt") SELECT "createdAt", "email", "id", "name", "notifyDailySummary", "notifyStaleTasks", "password", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
