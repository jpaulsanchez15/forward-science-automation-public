/*
  Warnings:

  - You are about to alter the column `price` on the `Line` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "Line" ALTER COLUMN "price" SET DATA TYPE BIGINT;
