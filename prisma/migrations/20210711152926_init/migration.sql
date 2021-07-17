/*
  Warnings:

  - You are about to drop the column `CodeReportId` on the `statusreportimage` table. All the data in the column will be lost.
  - Added the required column `StatusReportId` to the `StatusReportImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `statusreportimage` DROP FOREIGN KEY `statusreportimage_ibfk_2`;

-- DropForeignKey
ALTER TABLE `statusreportimage` DROP FOREIGN KEY `statusreportimage_ibfk_1`;

-- AlterTable
ALTER TABLE `statusreportimage` DROP COLUMN `CodeReportId`,
    ADD COLUMN `StatusReportId` INTEGER NOT NULL,
    ADD COLUMN `codeReportId` INTEGER;

-- AddForeignKey
ALTER TABLE `StatusReportImage` ADD FOREIGN KEY (`StatusReportId`) REFERENCES `StatusReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusReportImage` ADD FOREIGN KEY (`codeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE SET NULL ON UPDATE CASCADE;
