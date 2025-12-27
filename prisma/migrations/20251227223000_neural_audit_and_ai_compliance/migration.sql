-- CreateTable
CREATE TABLE IF NOT EXISTS "NeuralAudit" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "changeLog" TEXT,
    "justification" TEXT,
    "totalChanges" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'STABLE',
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NeuralAudit_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Safely add AI and Compliance fields to CompanySettings
DO $$ 
BEGIN
    -- AI Prompts & Instructions
    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "aiCustomInstructions" TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "aiMemoryPrompt" TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "aiStrategicDirectives" TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "aiSystemPrompt" TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    -- Compliance Dates
    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "lastAccountsHMRCDate" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "lastConfirmationStatementDate" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "lastFYEndDate" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "nextAccountsHMRCDue" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "nextConfirmationStatementDue" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "nextFYEndDate" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "lastAccountsCompaniesHouseDate" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE "CompanySettings" ADD COLUMN "nextAccountsCompaniesHouseDue" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

END $$;
