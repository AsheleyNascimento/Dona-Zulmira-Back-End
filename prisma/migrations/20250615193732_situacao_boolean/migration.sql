/*
  Warnings:

  - You are about to alter the column `situacao` on the `morador` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `morador` MODIFY `situacao` BOOLEAN NOT NULL;

-- RenameIndex
ALTER TABLE `usuario` RENAME INDEX `Usuario_cpf_key` TO `Usuario_cpf`;
