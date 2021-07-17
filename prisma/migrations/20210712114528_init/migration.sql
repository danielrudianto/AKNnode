/*
  Warnings:

  - You are about to drop the column `CodeProjectId` on the `requestforinformation` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedBy` on the `requestforinformation` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedDate` on the `requestforinformation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[CodeReportId]` on the table `RequestForInformation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `CodeReportId` to the `RequestForInformation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `requestforinformation` DROP FOREIGN KEY `requestforinformation_ibfk_1`;

-- AlterTable
ALTER TABLE `requestforinformation` DROP COLUMN `CodeProjectId`,
    DROP COLUMN `CreatedBy`,
    DROP COLUMN `CreatedDate`,
    ADD COLUMN `CodeReportId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `RequestForInformation_CodeReportId_unique` ON `RequestForInformation`(`CodeReportId`);

-- AddForeignKey
ALTER TABLE `RequestForInformation` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;
