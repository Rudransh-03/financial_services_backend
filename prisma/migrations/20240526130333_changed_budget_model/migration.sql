/*
  Warnings:

  - You are about to drop the column `endDate` on the `Budget` table. All the data in the column will be lost.
  - Added the required column `type` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "endDate",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "startDate" SET DATA TYPE TEXT;
