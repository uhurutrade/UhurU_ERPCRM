-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wireRoutingNumber" TEXT;
