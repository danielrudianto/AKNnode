-- CreateTable
CREATE TABLE `Client` (
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
CREATE TABLE `ClientContact` (
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
CREATE TABLE `CodeProject` (
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
CREATE TABLE `CodeProjectDocument` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Url` VARCHAR(191) NOT NULL,
    `CodeProjectId` INTEGER NOT NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CodeProjectUser` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `UserId` INTEGER NOT NULL,
    `CodeProjectId` INTEGER NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CodeReport` (
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
CREATE TABLE `CodeReportApproval` (
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
CREATE TABLE `DailyReportImage` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `CodeReportId` INTEGER NOT NULL,
    `ImageUrl` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,
    `Caption` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyTask` (
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
CREATE TABLE `Material` (
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
CREATE TABLE `Project` (
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
CREATE TABLE `ProjectTask` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Description` VARCHAR(191) NOT NULL,
    `ParentId` INTEGER NOT NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequestForInformation` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `CodeReportId` INTEGER NOT NULL,
    `Description` VARCHAR(191) NOT NULL,
    `Header` VARCHAR(191) NOT NULL,
    `AddressedFor` VARCHAR(191) NOT NULL,
    `IsDelete` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `RequestForInformation_CodeReportId_unique`(`CodeReportId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequestForInformationAnswer` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Answer` VARCHAR(191) NOT NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL,
    `RequestForInformationId` INTEGER NOT NULL,
    `IsDelete` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequestForInformationDocument` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `RequestForInformationId` INTEGER NOT NULL,
    `ImageUrl` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatusReport` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Status` VARCHAR(191) NOT NULL,
    `CodeReportId` INTEGER NOT NULL,

    UNIQUE INDEX `StatusReport_CodeReportId_unique`(`CodeReportId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatusReportImage` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `StatusReportId` INTEGER NOT NULL,
    `ImageUrl` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tool` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Description` VARCHAR(191) NOT NULL,
    `Quantity` INTEGER NOT NULL,
    `CodeReportId` INTEGER NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Weather` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `WeatherId` INTEGER NOT NULL,
    `CodeReportId` INTEGER NOT NULL,

    UNIQUE INDEX `Weather_CodeReportId_unique`(`CodeReportId`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Worker` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `CodeReportId` INTEGER NOT NULL,
    `Quantity` INTEGER NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserContact` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `PhoneNumber` VARCHAR(191) NOT NULL,
    `UserId` INTEGER NOT NULL,
    `WhatsappAvailable` BOOLEAN NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPosition` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Position` INTEGER NOT NULL,
    `EffectiveDate` DATETIME(3) NOT NULL,
    `CreatedBy` INTEGER NOT NULL,
    `CreatedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UserId` INTEGER NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Email` VARCHAR(191) NOT NULL,
    `FirstName` VARCHAR(191) NOT NULL,
    `LastName` VARCHAR(191) NOT NULL,
    `IsActive` BOOLEAN NOT NULL DEFAULT true,
    `Password` VARCHAR(191),
    `ImageUrl` VARCHAR(191),
    `ThumbnailUrl` VARCHAR(191),

    UNIQUE INDEX `User.Email_unique`(`Email`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Client` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientContact` ADD FOREIGN KEY (`ClientId`) REFERENCES `Client`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientContact` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeProject` ADD FOREIGN KEY (`ClientId`) REFERENCES `Client`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeProject` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeProject` ADD FOREIGN KEY (`ConfirmedBy`) REFERENCES `User`(`Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeProject` ADD FOREIGN KEY (`CompletedBy`) REFERENCES `User`(`Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeProjectDocument` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeProjectDocument` ADD FOREIGN KEY (`CodeProjectId`) REFERENCES `CodeProject`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeProjectUser` ADD FOREIGN KEY (`UserId`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeProjectUser` ADD FOREIGN KEY (`CodeProjectId`) REFERENCES `CodeProject`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeReport` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeReport` ADD FOREIGN KEY (`CodeProjectId`) REFERENCES `CodeProject`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeReportApproval` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeReportApproval` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeReportApproval` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyReportImage` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyTask` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Material` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD FOREIGN KEY (`CodeProjectId`) REFERENCES `CodeProject`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTask` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestForInformation` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestForInformationAnswer` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestForInformationAnswer` ADD FOREIGN KEY (`RequestForInformationId`) REFERENCES `RequestForInformation`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestForInformationDocument` ADD FOREIGN KEY (`RequestForInformationId`) REFERENCES `RequestForInformation`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusReport` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusReportImage` ADD FOREIGN KEY (`StatusReportId`) REFERENCES `StatusReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tool` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Weather` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Worker` ADD FOREIGN KEY (`CodeReportId`) REFERENCES `CodeReport`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserContact` ADD FOREIGN KEY (`UserId`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPosition` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPosition` ADD FOREIGN KEY (`UserId`) REFERENCES `User`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE;
