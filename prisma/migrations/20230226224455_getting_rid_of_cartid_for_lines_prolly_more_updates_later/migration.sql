/*
  Warnings:

  - You are about to drop the column `cartOrderId` on the `Lines` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Lines_cartOrderId_key";

-- AlterTable
ALTER TABLE "Lines" DROP COLUMN "cartOrderId";
