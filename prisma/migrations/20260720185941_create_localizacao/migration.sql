ALTER TABLE `empreendimento` DROP COLUMN `local`,
    ADD COLUMN `localizacaoId` VARCHAR(191) NOT NULL;

CREATE TABLE `Localizacao` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Localizacao_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Empreendimento` ADD CONSTRAINT `Empreendimento_localizacaoId_fkey` FOREIGN KEY (`localizacaoId`) REFERENCES `Localizacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
