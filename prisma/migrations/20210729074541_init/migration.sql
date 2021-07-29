-- CreateTable
CREATE TABLE `client` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Address` VARCHAR(191),
    `City` VARCHAR(191),
    `PhoneNumber` VARCHAR(191),
    `TaxIdentificationNumber` VARCHAR(191),
    `IsDelete` BOOLEAN NOT NULL DEFAULT false,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientContact` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Position` VARCHAR(191) NOT NULL,
    `PhoneNumber` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ClientId` INTEGER NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `codeProject` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `ClientId` INTEGER NOT NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ConfirmedDate` DATETIME(3),
    `ConfirmedBy` INTEGER,
    `Address` VARCHAR(191) NOT NULL,
    `DocumentName` VARCHAR(191) NOT NULL,
    `IsCompleted` BOOLEAN NOT NULL DEFAULT false,
    `CompletedDate` DATETIME(3),
    `CompletedBy` INTEGER,
    `IsDelete` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `codeProjectDocument` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Url` VARCHAR(191) NOT NULL,
    `CodeProjectId` INTEGER NOT NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `codeProjectUser` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `UserId` INTEGER NOT NULL,
    `CodeProjectId` INTEGER NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `codeReport` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Date` DATETIME(3) NOT NULL,
    `CodeProjectId` INTEGER NOT NULL,
    `Type` INTEGER NOT NULL,
    `IsDelete` BOOLEAN NOT NULL DEFAULT false,
    `Note` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `codeReportApproval` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `CodeReportId` INTEGER NOT NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Comment` VARCHAR(191) NOT NULL,
    `Approval` INTEGER NOT NULL,
    `IsDelete` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dailyReportImage` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `CodeReportId` INTEGER NOT NULL,
    `ImageUrl` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,
    `Caption` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dailyTask` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Description` VARCHAR(191) NOT NULL,
    `Unit` VARCHAR(191) NOT NULL,
    `Quantity` DOUBLE NOT NULL,
    `ParentId` INTEGER NOT NULL,
    `CodeReportId` INTEGER NOT NULL,
    `Note` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Quantity` DOUBLE NOT NULL,
    `Status` INTEGER NOT NULL,
    `Description` VARCHAR(191) NOT NULL,
    `Unit` VARCHAR(191) NOT NULL,
    `CodeReportId` INTEGER NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `BudgetPrice` DOUBLE NOT NULL,
    `Quantity` DOUBLE NOT NULL,
    `Done` DOUBLE NOT NULL,
    `IsDelete` BOOLEAN NOT NULL DEFAULT false,
    `CodeProjectId` INTEGER NOT NULL,
    `ParentId` INTEGER NOT NULL,
    `EstimatedDuration` DOUBLE NOT NULL,
    `Timeline` INTEGER NOT NULL,
    `Price` DOUBLE NOT NULL,
    `Description` VARCHAR(191) NOT NULL,
    `Unit` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projectTask` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Description` VARCHAR(191) NOT NULL,
    `ParentId` INTEGER NOT NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requestForInformation` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `CodeReportId` INTEGER NOT NULL,
    `Description` VARCHAR(191) NOT NULL,
    `Header` VARCHAR(191) NOT NULL,
    `AddressedFor` VARCHAR(191) NOT NULL,
    `IsDelete` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `requestForInformation_CodeReportId_unique`(`CodeReportId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requestForInformationAnswer` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Answer` VARCHAR(191) NOT NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL,
    `RequestForInformationId` INTEGER NOT NULL,
    `IsDelete` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requestForInformationDocument` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `RequestForInformationId` INTEGER NOT NULL,
    `ImageUrl` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statusReport` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Status` VARCHAR(191) NOT NULL,
    `CodeReportId` INTEGER NOT NULL,

    UNIQUE INDEX `statusReport_CodeReportId_unique`(`CodeReportId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statusReportImage` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `StatusReportId` INTEGER NOT NULL,
    `ImageUrl` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tool` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Description` VARCHAR(191) NOT NULL,
    `Quantity` INTEGER NOT NULL,
    `CodeReportId` INTEGER NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weather` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `WeatherId` INTEGER NOT NULL,
    `CodeReportId` INTEGER NOT NULL,

    UNIQUE INDEX `weather_CodeReportId_unique`(`CodeReportId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worker` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `CodeReportId` INTEGER NOT NULL,
    `Quantity` INTEGER NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userContact` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `PhoneNumber` VARCHAR(191) NOT NULL,
    `UserId` INTEGER NOT NULL,
    `WhatsappAvailable` BOOLEAN NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userPosition` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Position` INTEGER NOT NULL,
    `EffectiveDate` DATETIME(3) NOT NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UserId` INTEGER NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Email` VARCHAR(191) NOT NULL,
    `FirstName` VARCHAR(191) NOT NULL,
    `LastName` VARCHAR(191) NOT NULL,
    `IsActive` BOOLEAN NOT NULL DEFAULT true,
    `Password` VARCHAR(191),
    `ImageUrl` VARCHAR(191),
    `ThumbnailUrl` VARCHAR(191),

    UNIQUE INDEX `user.Email_unique`(`Email`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `client` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clientContact` ADD FOREIGN KEY (`ClientId`) REFERENCES `client`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clientContact` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeProject` ADD FOREIGN KEY (`ClientId`) REFERENCES `client`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeProject` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeProject` ADD FOREIGN KEY (`ConfirmedBy`) REFERENCES `user`(`Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeProject` ADD FOREIGN KEY (`CompletedBy`) REFERENCES `user`(`Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeProjectDocument` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeProjectDocument` ADD FOREIGN KEY (`CodeProjectId`) REFERENCES `codeProject`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeProjectUser` ADD FOREIGN KEY (`UserId`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeProjectUser` ADD FOREIGN KEY (`CodeProjectId`) REFERENCES `codeProject`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeReport` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeReport` ADD FOREIGN KEY (`CodeProjectId`) REFERENCES `codeProject`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeReportApproval` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `codeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeReportApproval` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `codeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `codeReportApproval` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dailyReportImage` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `codeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dailyTask` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `codeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `codeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project` ADD FOREIGN KEY (`CodeProjectId`) REFERENCES `codeProject`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projectTask` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requestForInformation` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `codeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requestForInformationAnswer` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requestForInformationAnswer` ADD FOREIGN KEY (`RequestForInformationId`) REFERENCES `requestForInformation`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requestForInformationDocument` ADD FOREIGN KEY (`RequestForInformationId`) REFERENCES `requestForInformation`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `statusReport` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `codeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `statusReportImage` ADD FOREIGN KEY (`StatusReportId`) REFERENCES `statusReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tool` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `codeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weather` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `codeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `codeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userContact` ADD FOREIGN KEY (`UserId`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userPosition` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userPosition` ADD FOREIGN KEY (`UserId`) REFERENCES `user`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;
