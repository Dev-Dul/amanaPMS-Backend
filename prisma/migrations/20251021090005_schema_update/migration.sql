/*
  Warnings:

  - You are about to drop the column `operatorId` on the `Bus` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shortName]` on the table `Route` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ticketId]` on the table `TripBoarding` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `make` to the `Bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Stop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortName` to the `Stop` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bus" DROP CONSTRAINT "Bus_operatorId_fkey";

-- AlterTable
ALTER TABLE "Bus" DROP COLUMN "operatorId",
ADD COLUMN     "conductorId" INTEGER,
ADD COLUMN     "driverId" INTEGER,
ADD COLUMN     "make" TEXT NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "busId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Stop" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "shortName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "trip" TEXT NOT NULL DEFAULT 'OUTBOUND';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'INDIVIDUAL';

-- CreateIndex
CREATE UNIQUE INDEX "Route_shortName_key" ON "Route"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "TripBoarding_ticketId_key" ON "TripBoarding"("ticketId");

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
