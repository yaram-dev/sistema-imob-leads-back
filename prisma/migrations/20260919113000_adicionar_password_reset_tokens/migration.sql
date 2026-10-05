CREATE TABLE `password_reset_token` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_token_tokenHash_key`(`tokenHash`),
    INDEX `password_reset_token_usuarioId_idx`(`usuarioId`),
    INDEX `password_reset_token_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`),

    CONSTRAINT `password_reset_token_usuarioId_fkey`
        FOREIGN KEY (`usuarioId`)
        REFERENCES `usuario` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;