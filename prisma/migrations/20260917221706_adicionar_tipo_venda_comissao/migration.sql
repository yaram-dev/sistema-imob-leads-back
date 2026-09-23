ALTER TABLE `comissao` DROP COLUMN `percentual`,
    ADD COLUMN `percentualCorretora` DECIMAL(5, 2) NULL,
    ADD COLUMN `percentualImobiliaria` DECIMAL(5, 2) NULL,
    ADD COLUMN `valorCorretora` DECIMAL(15, 2) NULL,
    ADD COLUMN `valorImobiliaria` DECIMAL(15, 2) NULL;

ALTER TABLE `venda` ADD COLUMN `tipoVenda` ENUM('IMOBILIARIA', 'AVULSA') NOT NULL DEFAULT 'AVULSA';
