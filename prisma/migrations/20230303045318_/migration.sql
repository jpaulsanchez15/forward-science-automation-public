/*
  Warnings:

  - A unique constraint covering the columns `[ordoroLink]` on the table `AspenOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AspenOrder_ordoroLink_key" ON "AspenOrder"("ordoroLink");
