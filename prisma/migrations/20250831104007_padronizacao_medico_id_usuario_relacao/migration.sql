/*
  Warnings:

  - You are about to drop the column `usuario_criacao` on the `medico` table. All the data in the column will be lost.
  - Added the required column `id_usuario` to the `medico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `medico` DROP COLUMN `usuario_criacao`,
    ADD COLUMN `id_usuario` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Medico_id_usuario_fkey` ON `medico`(`id_usuario`);

-- AddForeignKey
ALTER TABLE `medico` ADD CONSTRAINT `Medico_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
