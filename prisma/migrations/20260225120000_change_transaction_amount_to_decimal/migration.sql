-- AlterTable
ALTER TABLE "Transaction"
ALTER COLUMN "amount" TYPE DECIMAL(18,2)
USING "amount"::DECIMAL(18,2);
