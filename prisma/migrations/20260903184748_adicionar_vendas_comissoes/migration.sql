-- CreateTable
CREATE TABLE `venda` (
    `id` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `empreendimentoId` VARCHAR(191) NULL,
    `dataVenda` DATETIME(3) NOT NULL,
    `valorTabela` DECIMAL(15, 2) NOT NULL,
    `valorVenda` DECIMAL(15, 2) NOT NULL,
    `contratoNome` VARCHAR(191) NULL,
    `contratoUrl` VARCHAR(191) NULL,
    `observacao` VARCHAR(191) NULL,
    `status` ENUM('ATIVA', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'ATIVA',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `venda_leadId_idx`(`leadId`),
    INDEX `venda_empreendimentoId_idx`(`empreendimentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comissao` (
    `id` VARCHAR(191) NOT NULL,
    `vendaId` VARCHAR(191) NOT NULL,
    `percentual` DECIMAL(5, 2) NULL,
    `valorTotal` DECIMAL(15, 2) NOT NULL,
    `observacao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `comissao_vendaId_key`(`vendaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recebimentocomissao` (
    `id` VARCHAR(191) NOT NULL,
    `comissaoId` VARCHAR(191) NOT NULL,
    `numero` INTEGER NOT NULL,
    `valor` DECIMAL(15, 2) NOT NULL,
    `vencimento` DATETIME(3) NOT NULL,
    `status` ENUM('PENDENTE', 'PAGA', 'ATRASADA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `dataRecebimento` DATETIME(3) NULL,
    `observacao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `recebimentocomissao_comissaoId_idx`(`comissaoId`),
    INDEX `recebimentocomissao_vencimento_idx`(`vencimento`),
    INDEX `recebimentocomissao_status_idx`(`status`),
    UNIQUE INDEX `recebimentocomissao_comissaoId_numero_key`(`comissaoId`, `numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `venda` ADD CONSTRAINT `venda_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `lead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `venda` ADD CONSTRAINT `venda_empreendimentoId_fkey` FOREIGN KEY (`empreendimentoId`) REFERENCES `empreendimento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comissao` ADD CONSTRAINT `comissao_vendaId_fkey` FOREIGN KEY (`vendaId`) REFERENCES `venda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recebimentocomissao` ADD CONSTRAINT `recebimentocomissao_comissaoId_fkey` FOREIGN KEY (`comissaoId`) REFERENCES `comissao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `acompanhamento` RENAME INDEX `Acompanhamento_leadId_fkey` TO `Acompanhamento_leadId_idx`;

-- RenameIndex
ALTER TABLE `lead` RENAME INDEX `lead_empreendimentoId_fkey` TO `lead_empreendimentoId_idx`;
