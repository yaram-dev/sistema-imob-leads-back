ALTER TABLE `empreendimento` DROP FOREIGN KEY `Empreendimento_localizacaoId_fkey`;

ALTER TABLE `empreendimento` DROP FOREIGN KEY `Empreendimento_tipoId_fkey`;

ALTER TABLE `lead` DROP FOREIGN KEY `Lead_empreendimentoId_fkey`;

ALTER TABLE `lead` MODIFY `origem` ENUM('HOME_FORMULARIO', 'HOME_BOTAO', 'EMPREENDIMENTO', 'CADASTRO_MANUAL', 'INDICACAO', 'WHATSAPP', 'INSTAGRAM', 'OUTRO') NOT NULL DEFAULT 'HOME_FORMULARIO';

ALTER TABLE `empreendimento` ADD CONSTRAINT `empreendimento_tipoId_fkey` FOREIGN KEY (`tipoId`) REFERENCES `tipo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `empreendimento` ADD CONSTRAINT `empreendimento_localizacaoId_fkey` FOREIGN KEY (`localizacaoId`) REFERENCES `localizacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `lead` ADD CONSTRAINT `lead_empreendimentoId_fkey` FOREIGN KEY (`empreendimentoId`) REFERENCES `empreendimento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `empreendimento` RENAME INDEX `Empreendimento_slug_key` TO `empreendimento_slug_key`;

ALTER TABLE `faixainvestimento` RENAME INDEX `FaixaInvestimento_nome_key` TO `faixainvestimento_nome_key`;

ALTER TABLE `localizacao` RENAME INDEX `Localizacao_nome_key` TO `localizacao_nome_key`;

ALTER TABLE `prazocompra` RENAME INDEX `PrazoCompra_nome_key` TO `prazocompra_nome_key`;

ALTER TABLE `tipo` RENAME INDEX `Tipo_nome_key` TO `tipo_nome_key`;
