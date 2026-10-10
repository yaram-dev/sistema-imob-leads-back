CREATE TABLE `venda_documento` (
    `id` VARCHAR(191) NOT NULL,
    `vendaId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('FICHA_CADASTRO', 'CONTRATO', 'COMPROVANTE', 'OUTRO') NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `venda_documento_vendaId_idx`(`vendaId`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `venda_documento`
ADD CONSTRAINT `venda_documento_vendaId_fkey`
FOREIGN KEY (`vendaId`) REFERENCES `venda`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;