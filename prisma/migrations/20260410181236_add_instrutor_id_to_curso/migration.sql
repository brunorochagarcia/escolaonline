-- AlterTable
ALTER TABLE "Curso" ADD COLUMN     "instrutorId" TEXT;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_instrutorId_fkey" FOREIGN KEY ("instrutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
