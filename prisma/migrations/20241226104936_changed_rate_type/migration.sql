/*
  Warnings:

  - Added the required column `rate` to the `ExchangeRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ExchangeRate` table without a default value. This is not possible if the table is not empty.
  - Made the column `fromCurrencyId` on table `ExchangeRate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `toCurrencyId` on table `ExchangeRate` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ExchangeRate" DROP CONSTRAINT "ExchangeRate_fromCurrencyId_fkey";

-- DropForeignKey
ALTER TABLE "ExchangeRate" DROP CONSTRAINT "ExchangeRate_toCurrencyId_fkey";

-- AlterTable
ALTER TABLE "ExchangeRate" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "fromCurrencyId" SET NOT NULL,
ALTER COLUMN "toCurrencyId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_fromCurrencyId_fkey" FOREIGN KEY ("fromCurrencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_toCurrencyId_fkey" FOREIGN KEY ("toCurrencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
