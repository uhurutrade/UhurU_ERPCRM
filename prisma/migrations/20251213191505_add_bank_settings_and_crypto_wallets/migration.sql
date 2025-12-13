/*
  Warnings:

  - You are about to drop the column `bankName` on the `BankAccount` table. All the data in the column will be lost.
  - Added the required column `accountType` to the `BankAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankId` to the `BankAccount` table without a default value. This is not possible if the table is not empty.
  - Made the column `accountName` on table `BankAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "bankName",
ADD COLUMN     "accountNumberUK" TEXT,
ADD COLUMN     "accountType" TEXT NOT NULL,
ADD COLUMN     "availableBalance" DECIMAL(15,2),
ADD COLUMN     "bankId" TEXT NOT NULL,
ADD COLUMN     "bcNumber" TEXT,
ADD COLUMN     "currentBalance" DECIMAL(15,2),
ADD COLUMN     "ibanCH" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastBalanceUpdate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "routingNumber" TEXT,
ADD COLUMN     "sortCode" TEXT,
ADD COLUMN     "swiftBic" TEXT,
ALTER COLUMN "accountName" SET NOT NULL;

-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankType" TEXT NOT NULL,
    "swiftBic" TEXT,
    "bankCode" TEXT,
    "website" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "bankAddress" TEXT,
    "bankCity" TEXT,
    "bankPostcode" TEXT,
    "bankCountry" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoWallet" (
    "id" TEXT NOT NULL,
    "walletName" TEXT NOT NULL,
    "walletType" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "contractAddress" TEXT,
    "walletAddress" TEXT NOT NULL,
    "provider" TEXT,
    "currentBalance" DECIMAL(25,8),
    "balanceUSD" DECIMAL(15,2),
    "lastBalanceUpdate" TIMESTAMP(3),
    "isMultiSig" BOOLEAN NOT NULL DEFAULT false,
    "requiredSignatures" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(25,8) NOT NULL,
    "asset" TEXT NOT NULL,
    "amountUSD" DECIMAL(15,2),
    "exchangeRate" DECIMAL(15,8),
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "networkFee" DECIMAL(25,8),
    "networkFeeUSD" DECIMAL(15,2),
    "status" TEXT NOT NULL,
    "confirmations" INTEGER,
    "blockNumber" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "reference" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CryptoWallet_walletAddress_key" ON "CryptoWallet"("walletAddress");

-- CreateIndex
CREATE INDEX "CryptoWallet_blockchain_idx" ON "CryptoWallet"("blockchain");

-- CreateIndex
CREATE INDEX "CryptoWallet_asset_idx" ON "CryptoWallet"("asset");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoTransaction_txHash_key" ON "CryptoTransaction"("txHash");

-- CreateIndex
CREATE INDEX "CryptoTransaction_walletId_idx" ON "CryptoTransaction"("walletId");

-- CreateIndex
CREATE INDEX "CryptoTransaction_timestamp_idx" ON "CryptoTransaction"("timestamp");

-- CreateIndex
CREATE INDEX "BankAccount_bankId_idx" ON "BankAccount"("bankId");

-- CreateIndex
CREATE INDEX "BankAccount_currency_idx" ON "BankAccount"("currency");

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoTransaction" ADD CONSTRAINT "CryptoTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "CryptoWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
