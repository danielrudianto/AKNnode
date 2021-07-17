-- AddForeignKey
ALTER TABLE `StatusReportImage` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `StatusReport`(`CodeReportId`) ON DELETE CASCADE ON UPDATE CASCADE;
