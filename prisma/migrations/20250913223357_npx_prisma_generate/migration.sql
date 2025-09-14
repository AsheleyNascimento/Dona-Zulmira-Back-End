-- AlterTable
ALTER TABLE `medicamentoprescricao` ADD COLUMN `id_usuario` INTEGER NULL;

-- CreateIndex
CREATE INDEX `MedicamentoPrescricao_id_usuario_fkey` ON `medicamentoprescricao`(`id_usuario`);

-- AddForeignKey
ALTER TABLE `medicamentoprescricao` ADD CONSTRAINT `MedicamentoPrescricao_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;
