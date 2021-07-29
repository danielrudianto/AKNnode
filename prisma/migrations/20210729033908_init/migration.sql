-- AlterIndex
ALTER TABLE `requestforinformation` RENAME INDEX `RequestForInformation_CodeReportId_unique` TO `requestForInformation_CodeReportId_unique`;

-- AlterIndex
ALTER TABLE `statusreport` RENAME INDEX `StatusReport_CodeReportId_unique` TO `statusReport_CodeReportId_unique`;

-- AlterIndex
ALTER TABLE `user` RENAME INDEX `User.Email_unique` TO `user.Email_unique`;

-- AlterIndex
ALTER TABLE `weather` RENAME INDEX `Weather_CodeReportId_unique` TO `weather_CodeReportId_unique`;
