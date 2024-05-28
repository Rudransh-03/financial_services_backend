/*
  Warnings:

  - You are about to drop the column `type` on the `Budget` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "type",
ADD COLUMN     "endDate" TEXT NOT NULL;
