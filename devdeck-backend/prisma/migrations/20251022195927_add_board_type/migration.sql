-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_boards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TASK'
);
INSERT INTO "new_boards" ("id", "name") SELECT "id", "name" FROM "boards";
DROP TABLE "boards";
ALTER TABLE "new_boards" RENAME TO "boards";
CREATE UNIQUE INDEX "boards_name_key" ON "boards"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
