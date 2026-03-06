DO $$
BEGIN
    IF to_regclass('"TransactionCategory"') IS NOT NULL THEN
        ALTER TABLE "TransactionCategory" DROP CONSTRAINT IF EXISTS "TransactionCategory_userId_fkey";
    END IF;
END $$;

-- DropIndex
DROP INDEX IF EXISTS "TransactionCategory_type_isActive_idx";

-- DropIndex
DROP INDEX IF EXISTS "TransactionCategory_userId_type_isActive_idx";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

DO $$
BEGIN
    IF to_regclass('"TransactionCategory"') IS NOT NULL THEN
        ALTER TABLE "TransactionCategory"
        ADD CONSTRAINT "TransactionCategory_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
