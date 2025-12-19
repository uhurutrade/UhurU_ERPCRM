-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "fileHash" TEXT;

-- AlterTable
ALTER TABLE "BankStatement" ADD COLUMN     "fileHash" TEXT;

-- AlterTable
ALTER TABLE "ComplianceDocument" ADD COLUMN     "documentDate" TIMESTAMP(3),
ADD COLUMN     "extractedData" JSONB,
ADD COLUMN     "fileHash" TEXT,
ADD COLUMN     "isSuperseded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "strategicInsights" TEXT,
ADD COLUMN     "supersededById" TEXT,
ADD COLUMN     "userNotes" TEXT;
