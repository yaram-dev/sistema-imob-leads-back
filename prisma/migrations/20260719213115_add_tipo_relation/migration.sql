ALTER TABLE `empreendimento` DROP COLUMN `tipo`,
    ADD COLUMN `tipoId` VARCHAR(191) NOT NULL;

ALTER TABLE `Empreendimento` ADD CONSTRAINT `Empreendimento_tipoId_fkey` FOREIGN KEY (`tipoId`) REFERENCES `Tipo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
