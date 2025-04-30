/*
  Warnings:

  - Added the required column `creatorId` to the `Family` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Family" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "joinCode" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Get the first member of each family and set them as the creator
-- For SQLite, we use a simple approach since it doesn't support complex subqueries
CREATE TABLE "_temp_family_creators" AS
SELECT f.id AS family_id, 
       (SELECT u.id FROM "User" u WHERE u.familyId = f.id LIMIT 1) AS user_id
FROM "Family" f;

-- Insert data with the creatorId set from our temporary lookup
INSERT INTO "new_Family" ("id", "name", "joinCode", "creatorId", "createdAt", "updatedAt")
SELECT f.id, f.name, f.joinCode, COALESCE(t.user_id, 'unknown'), f.createdAt, f.updatedAt
FROM "Family" f
LEFT JOIN "_temp_family_creators" t ON f.id = t.family_id;

-- Clean up
DROP TABLE "_temp_family_creators";

DROP TABLE "Family";
ALTER TABLE "new_Family" RENAME TO "Family";
CREATE UNIQUE INDEX "Family_joinCode_key" ON "Family"("joinCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
