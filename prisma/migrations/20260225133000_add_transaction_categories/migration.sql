-- CreateTable
CREATE TABLE "TransactionCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionCategory_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "TransactionCategory_type_isActive_idx"
ON "TransactionCategory"("type", "isActive");

CREATE INDEX "TransactionCategory_userId_type_isActive_idx"
ON "TransactionCategory"("userId", "type", "isActive");

CREATE UNIQUE INDEX "TransactionCategory_default_type_name_key"
ON "TransactionCategory"("type", LOWER("name"))
WHERE "userId" IS NULL;

CREATE UNIQUE INDEX "TransactionCategory_user_type_name_key"
ON "TransactionCategory"("userId", "type", LOWER("name"))
WHERE "userId" IS NOT NULL;

-- Foreign key
ALTER TABLE "TransactionCategory"
ADD CONSTRAINT "TransactionCategory_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default income categories
INSERT INTO "TransactionCategory" ("id", "name", "type", "isActive", "userId", "createdAt", "updatedAt")
VALUES
    ('default-income-salary', 'Salary', 'income', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default-income-freelance', 'Freelance', 'income', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default-income-bonus', 'Bonus', 'income', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default-income-interest', 'Interest', 'income', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default-income-gift', 'Gift', 'income', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Seed default expense categories
INSERT INTO "TransactionCategory" ("id", "name", "type", "isActive", "userId", "createdAt", "updatedAt")
VALUES
    ('default-expense-food', 'Food', 'expense', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default-expense-transport', 'Transport', 'expense', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default-expense-bills', 'Bills', 'expense', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default-expense-rent', 'Rent', 'expense', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default-expense-health', 'Health', 'expense', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default-expense-shopping', 'Shopping', 'expense', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default-expense-education', 'Education', 'expense', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('default-expense-entertainment', 'Entertainment', 'expense', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
