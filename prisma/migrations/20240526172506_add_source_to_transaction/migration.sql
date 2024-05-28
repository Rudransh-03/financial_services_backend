/*
  Warnings:

  - Added the required column `leftAmount` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "leftAmount" DOUBLE PRECISION NOT NULL;
