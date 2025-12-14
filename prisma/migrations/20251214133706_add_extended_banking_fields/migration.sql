-- Add extended banking fields to BankTransaction table
-- These fields are added as nullable to preserve existing data

-- Add counterparty field (Payer/Payee/Beneficiary name)
ALTER TABLE "BankTransaction" ADD COLUMN IF NOT EXISTS "counterparty" TEXT;

-- Add merchant field (for card payments)
ALTER TABLE "BankTransaction" ADD COLUMN IF NOT EXISTS "merchant" TEXT;

-- Add balanceAfter field (running balance from bank statement)
ALTER TABLE "BankTransaction" ADD COLUMN IF NOT EXISTS "balanceAfter" DECIMAL(15,2);

-- Add exchangeRate field (FX rate used in transaction)
ALTER TABLE "BankTransaction" ADD COLUMN IF NOT EXISTS "exchangeRate" DECIMAL(15,8);

-- Add type field (TRANSFER, CARD_PAYMENT, EXCHANGE, FEE, etc.)
ALTER TABLE "BankTransaction" ADD COLUMN IF NOT EXISTS "type" TEXT;
