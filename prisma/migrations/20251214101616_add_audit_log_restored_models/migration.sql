-- CreateTable
CREATE TABLE "DeletedTransaction" (
    "id" TEXT NOT NULL,
    "originalId" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bankAccountName" TEXT,
    "bankName" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedBy" TEXT,
    "reason" TEXT,
    "fullSnapshot" TEXT,

    CONSTRAINT "DeletedTransaction_pkey" PRIMARY KEY ("id")
);
