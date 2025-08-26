-- CreateTable
CREATE TABLE `Usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_usuario` VARCHAR(191) NOT NULL,
    `nome_completo` VARCHAR(191) NOT NULL,
    `senha_hash` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `funcao` VARCHAR(191) NOT NULL,
    `situacao` BOOLEAN NOT NULL,

    UNIQUE INDEX `Usuario_nome_usuario_key`(`nome_usuario`),
    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medico` (
    `id_medico` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_completo` VARCHAR(191) NOT NULL,
    `crm` VARCHAR(191) NOT NULL,
    `situacao` BOOLEAN NOT NULL,

    UNIQUE INDEX `Medico_crm_key`(`crm`),
    PRIMARY KEY (`id_medico`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Morador` (
    `id_morador` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_completo` VARCHAR(191) NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `data_cadastro` DATETIME(3) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `rg` VARCHAR(191) NOT NULL,
    `situacao` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Morador_cpf_key`(`cpf`),
    PRIMARY KEY (`id_morador`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvolucaoIndividual` (
    `id_evolucao_individual` INTEGER NOT NULL AUTO_INCREMENT,
    `id_morador` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `data_hora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observacoes` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_evolucao_individual`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RelatorioDiarioGeral` (
    `id_relatorio_diario_geral` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_evolucao_individual` INTEGER NOT NULL,
    `data_hora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observacoes` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_relatorio_diario_geral`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medicamento` (
    `id_medicamento` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_medicamento` VARCHAR(191) NOT NULL,
    `situacao` BOOLEAN NOT NULL,

    PRIMARY KEY (`id_medicamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prescricao` (
    `id_prescricao` INTEGER NOT NULL AUTO_INCREMENT,
    `id_morador` INTEGER NOT NULL,
    `id_medico` INTEGER NOT NULL,
    `mes` VARCHAR(191) NOT NULL,
    `ano` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_prescricao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MedicamentoPrescricao` (
    `id_medicamento_prescricao` INTEGER NOT NULL AUTO_INCREMENT,
    `id_medicamento` INTEGER NOT NULL,
    `id_prescricao` INTEGER NOT NULL,
    `posologia` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_medicamento_prescricao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medicacao` (
    `id_medicacao` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_medicamento_prescricao` INTEGER NOT NULL,
    `data_hora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_medicacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Morador` ADD CONSTRAINT `Morador_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvolucaoIndividual` ADD CONSTRAINT `EvolucaoIndividual_id_morador_fkey` FOREIGN KEY (`id_morador`) REFERENCES `Morador`(`id_morador`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvolucaoIndividual` ADD CONSTRAINT `EvolucaoIndividual_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RelatorioDiarioGeral` ADD CONSTRAINT `RelatorioDiarioGeral_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RelatorioDiarioGeral` ADD CONSTRAINT `RelatorioDiarioGeral_id_evolucao_individual_fkey` FOREIGN KEY (`id_evolucao_individual`) REFERENCES `EvolucaoIndividual`(`id_evolucao_individual`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescricao` ADD CONSTRAINT `Prescricao_id_morador_fkey` FOREIGN KEY (`id_morador`) REFERENCES `Morador`(`id_morador`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescricao` ADD CONSTRAINT `Prescricao_id_medico_fkey` FOREIGN KEY (`id_medico`) REFERENCES `Medico`(`id_medico`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicamentoPrescricao` ADD CONSTRAINT `MedicamentoPrescricao_id_medicamento_fkey` FOREIGN KEY (`id_medicamento`) REFERENCES `Medicamento`(`id_medicamento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicamentoPrescricao` ADD CONSTRAINT `MedicamentoPrescricao_id_prescricao_fkey` FOREIGN KEY (`id_prescricao`) REFERENCES `Prescricao`(`id_prescricao`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medicacao` ADD CONSTRAINT `Medicacao_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medicacao` ADD CONSTRAINT `Medicacao_id_medicamento_prescricao_fkey` FOREIGN KEY (`id_medicamento_prescricao`) REFERENCES `MedicamentoPrescricao`(`id_medicamento_prescricao`) ON DELETE RESTRICT ON UPDATE CASCADE;
