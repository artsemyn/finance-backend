-- DropForeignKey
ALTER TABLE "TransactionCategory" DROP CONSTRAINT "TransactionCategory_userId_fkey";

-- DropIndex
DROP INDEX "TransactionCategory_type_isActive_idx";

-- DropIndex
DROP INDEX "TransactionCategory_userId_type_isActive_idx";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AddForeignKey
ALTER TABLE "TransactionCategory" ADD CONSTRAINT "TransactionCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
