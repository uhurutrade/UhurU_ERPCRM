-- Extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- CompanySettings: Safe add columns
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "invoicePrefix" TEXT NOT NULL DEFAULT 'INV-';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "nextInvoiceNumber" INTEGER NOT NULL DEFAULT 1;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Invoice: Safe add columns
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE "Invoice" ADD COLUMN "notes" TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE "Invoice" ADD COLUMN "footerNote" TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE "Invoice" ADD COLUMN "bankAccountId" TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE "Invoice" ADD COLUMN "cryptoWalletId" TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE "Invoice" ADD COLUMN "deletedAt" TIMESTAMP(3);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Foreign Keys Refresh
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_bankAccountId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_cryptoWalletId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_cryptoWalletId_fkey" FOREIGN KEY ("cryptoWalletId") REFERENCES "CryptoWallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DocumentChunk: Ensure proper vector type for embeddings
DO $$ 
BEGIN
    -- Try to convert if column exists
    ALTER TABLE "DocumentChunk" ALTER COLUMN "embedding" TYPE vector(1536) USING embedding::vector(1536);
EXCEPTION
    WHEN undefined_column THEN
        -- Create if missing
        ALTER TABLE "DocumentChunk" ADD COLUMN "embedding" vector(1536);
    WHEN OTHERS THEN
        -- If conversion fails (e.g. incompatible data), drop and recreate
        ALTER TABLE "DocumentChunk" DROP COLUMN IF EXISTS "embedding";
        ALTER TABLE "DocumentChunk" ADD COLUMN "embedding" vector(1536);
END $$;
