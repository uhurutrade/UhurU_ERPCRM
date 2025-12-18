-- CreateTable
CREATE TABLE "ComplianceDocument" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT,
    "documentType" TEXT,
    "path" TEXT NOT NULL,
    "size" INTEGER,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "vectorId" TEXT,
    "fiscalYear" TEXT,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceDocument_pkey" PRIMARY KEY ("id")
);
