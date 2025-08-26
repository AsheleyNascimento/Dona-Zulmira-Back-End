/*
  Warnings:

  - Added the required column `usuario_criacao` to the `medico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `medico` ADD COLUMN `usuario_criacao` VARCHAR(191) NOT NULL;
