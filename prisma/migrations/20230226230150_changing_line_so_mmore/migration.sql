/*
  Warnings:

  - You are about to drop the `Lines` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Lines";

-- CreateTable
CREATE TABLE "Line" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "Line_pkey" PRIMARY KEY ("id")
);
