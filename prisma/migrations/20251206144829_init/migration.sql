/*
  Warnings:

  - You are about to alter the column `why` on the `About` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `why2` on the `About` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_About" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "paragraph" TEXT NOT NULL,
    "why" JSONB NOT NULL,
    "why2" JSONB NOT NULL
);
INSERT INTO "new_About" ("id", "paragraph", "why", "why2") SELECT "id", "paragraph", "why", "why2" FROM "About";
DROP TABLE "About";
ALTER TABLE "new_About" RENAME TO "About";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
