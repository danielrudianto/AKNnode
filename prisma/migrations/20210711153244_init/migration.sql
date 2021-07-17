/*
  Warnings:

  - You are about to drop the column `codeReportId` on the `statusreportimage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `statusreportimage` DROP FOREIGN KEY `statusreportimage_ibfk_2`;

-- AlterTable
ALTER TABLE `statusreportimage` DROP COLUMN `codeReportId`;
