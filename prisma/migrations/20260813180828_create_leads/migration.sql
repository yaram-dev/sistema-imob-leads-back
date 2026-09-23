CREATE TABLE `Lead` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `regiao` VARCHAR(191) NULL,
    `tipoImovel` VARCHAR(191) NULL,
    `faixaInvestimento` VARCHAR(191) NULL,
    `prazo` VARCHAR(191) NULL,
    `mensagem` VARCHAR(191) NULL,
    `empreendimentoId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'NOVO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Lead` ADD CONSTRAINT `Lead_empreendimentoId_fkey` FOREIGN KEY (`empreendimentoId`) REFERENCES `Empreendimento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
