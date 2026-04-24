-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PAGO', 'PENDENTE', 'ATRASADO');

-- AlterTable
ALTER TABLE "Matricula" ADD COLUMN     "statusPagamento" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE';
