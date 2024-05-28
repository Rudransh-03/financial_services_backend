-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "source" TEXT,
ALTER COLUMN "type" DROP NOT NULL;
