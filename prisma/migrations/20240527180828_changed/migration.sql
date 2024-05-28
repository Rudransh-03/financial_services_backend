/*
  Warnings:

  - You are about to drop the column `source` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `name` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "source",
ADD COLUMN     "name" TEXT NOT NULL;
