-- CreateTable
CREATE TABLE `RelatorioEvolucao` (
    `id_relatorio_diario_geral` INTEGER NOT NULL,
    `id_evolucao_individual` INTEGER NOT NULL,

    INDEX `RelatorioEvolucao_id_evolucao_individual_idx`(`id_evolucao_individual`),
    PRIMARY KEY (`id_relatorio_diario_geral`, `id_evolucao_individual`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RelatorioEvolucao` ADD CONSTRAINT `RelatorioEvolucao_id_relatorio_diario_geral_fkey` FOREIGN KEY (`id_relatorio_diario_geral`) REFERENCES `relatoriodiariogeral`(`id_relatorio_diario_geral`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RelatorioEvolucao` ADD CONSTRAINT `RelatorioEvolucao_id_evolucao_individual_fkey` FOREIGN KEY (`id_evolucao_individual`) REFERENCES `evolucaoindividual`(`id_evolucao_individual`) ON DELETE CASCADE ON UPDATE CASCADE;
