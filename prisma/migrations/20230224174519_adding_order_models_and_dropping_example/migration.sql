/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Example";

-- CreateTable
CREATE TABLE "Lines" (
    "id" TEXT NOT NULL,
    "cartOrderId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "shopifyOrderId" TEXT,
    "aspenOrderId" TEXT,

    CONSTRAINT "Lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifyOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackingNumber" INTEGER NOT NULL,

    CONSTRAINT "ShopifyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AspenOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "officeName" TEXT NOT NULL,
    "ordoroLink" TEXT NOT NULL,
    "trackingNumber" INTEGER NOT NULL,

    CONSTRAINT "AspenOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lines_cartOrderId_key" ON "Lines"("cartOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyOrder_orderNumber_key" ON "ShopifyOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyOrder_trackingNumber_key" ON "ShopifyOrder"("trackingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AspenOrder_orderNumber_key" ON "AspenOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AspenOrder_trackingNumber_key" ON "AspenOrder"("trackingNumber");
