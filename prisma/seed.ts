import { PrismaClient, Status } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpeza na ordem correta (respeitando foreign keys)
  await prisma.nota.deleteMany()
  await prisma.matricula.deleteMany()
  await prisma.aluno.deleteMany()
  await prisma.curso.deleteMany()
  await prisma.user.deleteMany()

  // -------------------------
  // Admin
  // -------------------------
  await prisma.user.create({
    data: {
      nome: 'Administrador',
      email: 'admin@escolaonline.com',
      senha: await bcrypt.hash('admin123', 10),
    },
  })

  // -------------------------
  // Cursos
  // -------------------------
  const [webFullStack, pythonDados, uxUi, bancoDados] = await Promise.all([
    prisma.curso.create({
      data: {
        nome: 'Desenvolvimento Web Full Stack',
        descricao: 'Aprenda HTML, CSS, JavaScript, React e Node.js do zero ao avançado.',
        cargaHoraria: 120,
        instrutor: 'Rafael Mendes',
        status: Status.ATIVO,
      },
    }),
    prisma.curso.create({
      data: {
        nome: 'Python para Dados',
        descricao: 'Introdução a Python com foco em análise de dados, Pandas e visualização.',
        cargaHoraria: 80,
        instrutor: 'Camila Rocha',
        status: Status.ATIVO,
      },
    }),
    prisma.curso.create({
      data: {
        nome: 'UX/UI Design',
        descricao: 'Fundamentos de design de interfaces, prototipação e usabilidade.',
        cargaHoraria: 60,
        instrutor: 'Fernanda Lima',
        status: Status.ATIVO,
      },
    }),
    prisma.curso.create({
      data: {
        nome: 'Banco de Dados Relacional',
        descricao: 'SQL avançado, modelagem relacional, índices e otimização de queries.',
        cargaHoraria: 40,
        instrutor: 'Marcos Oliveira',
        status: Status.INATIVO,
      },
    }),
  ])

  // -------------------------
  // Alunos
  // -------------------------
  const [ana, bruno, carla, diego, elisa, felipe, gabriela, hugo] = await Promise.all([
    prisma.aluno.create({
      data: { nome: 'Ana Paula Ferreira', email: 'ana.ferreira@email.com', dataNascimento: new Date('2000-03-15') },
    }),
    prisma.aluno.create({
      data: { nome: 'Bruno Costa', email: 'bruno.costa@email.com', dataNascimento: new Date('1998-07-22') },
    }),
    prisma.aluno.create({
      data: { nome: 'Carla Souza', email: 'carla.souza@email.com', dataNascimento: new Date('2001-11-08') },
    }),
    prisma.aluno.create({
      data: { nome: 'Diego Martins', email: 'diego.martins@email.com', dataNascimento: new Date('1999-05-30') },
    }),
    prisma.aluno.create({
      data: { nome: 'Elisa Nunes', email: 'elisa.nunes@email.com', dataNascimento: new Date('2002-01-19') },
    }),
    prisma.aluno.create({
      data: { nome: 'Felipe Alves', email: 'felipe.alves@email.com', dataNascimento: new Date('1997-09-04') },
    }),
    prisma.aluno.create({
      data: { nome: 'Gabriela Lima', email: 'gabriela.lima@email.com', dataNascimento: new Date('2000-12-27') },
    }),
    prisma.aluno.create({
      data: { nome: 'Hugo Pereira', email: 'hugo.pereira@email.com', dataNascimento: new Date('1996-06-13') },
    }),
  ])

  // -------------------------
  // Matrículas e Notas
  // -------------------------

  // Ana — Web Full Stack (Aprovada: média 8.5)
  const mAnaWeb = await prisma.matricula.create({
    data: { alunoId: ana.id, cursoId: webFullStack.id, dataInicio: new Date('2024-02-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mAnaWeb.id, descricao: 'Prova 1', valor: 8.5, data: new Date('2024-03-10') },
      { matriculaId: mAnaWeb.id, descricao: 'Prova 2', valor: 9.0, data: new Date('2024-04-15') },
      { matriculaId: mAnaWeb.id, descricao: 'Trabalho Final', valor: 8.0, data: new Date('2024-06-20') },
    ],
  })

  // Ana — Python para Dados (Em andamento: média 6.2)
  const mAnaPython = await prisma.matricula.create({
    data: { alunoId: ana.id, cursoId: pythonDados.id, dataInicio: new Date('2024-08-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mAnaPython.id, descricao: 'Prova 1', valor: 6.0, data: new Date('2024-09-10') },
      { matriculaId: mAnaPython.id, descricao: 'Prova 2', valor: 6.5, data: new Date('2024-10-15') },
    ],
  })

  // Bruno — Web Full Stack (Reprovado: média 4.3)
  const mBrunoWeb = await prisma.matricula.create({
    data: { alunoId: bruno.id, cursoId: webFullStack.id, dataInicio: new Date('2024-02-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mBrunoWeb.id, descricao: 'Prova 1', valor: 4.0, data: new Date('2024-03-10') },
      { matriculaId: mBrunoWeb.id, descricao: 'Prova 2', valor: 3.5, data: new Date('2024-04-15') },
      { matriculaId: mBrunoWeb.id, descricao: 'Trabalho Final', valor: 5.5, data: new Date('2024-06-20') },
    ],
  })

  // Bruno — UX/UI Design (Aprovado: média 7.8)
  const mBrunoUx = await prisma.matricula.create({
    data: { alunoId: bruno.id, cursoId: uxUi.id, dataInicio: new Date('2024-05-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mBrunoUx.id, descricao: 'Projeto 1', valor: 7.5, data: new Date('2024-06-05') },
      { matriculaId: mBrunoUx.id, descricao: 'Projeto 2', valor: 8.0, data: new Date('2024-07-10') },
      { matriculaId: mBrunoUx.id, descricao: 'Apresentação Final', valor: 8.0, data: new Date('2024-08-01') },
    ],
  })

  // Carla — Python para Dados (Aprovada: média 9.2)
  const mCarlaPython = await prisma.matricula.create({
    data: { alunoId: carla.id, cursoId: pythonDados.id, dataInicio: new Date('2024-03-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mCarlaPython.id, descricao: 'Prova 1', valor: 9.5, data: new Date('2024-04-10') },
      { matriculaId: mCarlaPython.id, descricao: 'Prova 2', valor: 9.0, data: new Date('2024-05-15') },
      { matriculaId: mCarlaPython.id, descricao: 'Projeto Final', valor: 9.0, data: new Date('2024-07-01') },
    ],
  })

  // Carla — Banco de Dados (Em andamento: média 5.5)
  const mCarlaDB = await prisma.matricula.create({
    data: { alunoId: carla.id, cursoId: bancoDados.id, dataInicio: new Date('2024-09-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mCarlaDB.id, descricao: 'Prova 1', valor: 5.5, data: new Date('2024-10-10') },
    ],
  })

  // Diego — UX/UI Design (Reprovado: média 3.8)
  const mDiegoUx = await prisma.matricula.create({
    data: { alunoId: diego.id, cursoId: uxUi.id, dataInicio: new Date('2024-05-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mDiegoUx.id, descricao: 'Projeto 1', valor: 4.0, data: new Date('2024-06-05') },
      { matriculaId: mDiegoUx.id, descricao: 'Projeto 2', valor: 3.5, data: new Date('2024-07-10') },
      { matriculaId: mDiegoUx.id, descricao: 'Apresentação Final', valor: 4.0, data: new Date('2024-08-01') },
    ],
  })

  // Diego — Web Full Stack (Aprovado: média 7.2)
  const mDiegoWeb = await prisma.matricula.create({
    data: { alunoId: diego.id, cursoId: webFullStack.id, dataInicio: new Date('2024-02-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mDiegoWeb.id, descricao: 'Prova 1', valor: 7.0, data: new Date('2024-03-10') },
      { matriculaId: mDiegoWeb.id, descricao: 'Prova 2', valor: 7.5, data: new Date('2024-04-15') },
      { matriculaId: mDiegoWeb.id, descricao: 'Trabalho Final', valor: 7.0, data: new Date('2024-06-20') },
    ],
  })

  // Elisa — Python para Dados (sem notas — Em andamento)
  await prisma.matricula.create({
    data: { alunoId: elisa.id, cursoId: pythonDados.id, dataInicio: new Date('2024-11-01') },
  })

  // Elisa — UX/UI Design (Aprovada: média 8.0)
  const mElisaUx = await prisma.matricula.create({
    data: { alunoId: elisa.id, cursoId: uxUi.id, dataInicio: new Date('2024-05-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mElisaUx.id, descricao: 'Projeto 1', valor: 8.0, data: new Date('2024-06-05') },
      { matriculaId: mElisaUx.id, descricao: 'Projeto 2', valor: 8.5, data: new Date('2024-07-10') },
      { matriculaId: mElisaUx.id, descricao: 'Apresentação Final', valor: 7.5, data: new Date('2024-08-01') },
    ],
  })

  // Felipe — Banco de Dados (Aprovado: média 7.5)
  const mFelipeDB = await prisma.matricula.create({
    data: { alunoId: felipe.id, cursoId: bancoDados.id, dataInicio: new Date('2024-03-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mFelipeDB.id, descricao: 'Prova 1', valor: 7.0, data: new Date('2024-04-10') },
      { matriculaId: mFelipeDB.id, descricao: 'Prova 2', valor: 8.0, data: new Date('2024-05-15') },
      { matriculaId: mFelipeDB.id, descricao: 'Projeto Final', valor: 7.5, data: new Date('2024-07-01') },
    ],
  })

  // Felipe — Web Full Stack (Em andamento: média 6.0)
  const mFelipeWeb = await prisma.matricula.create({
    data: { alunoId: felipe.id, cursoId: webFullStack.id, dataInicio: new Date('2024-08-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mFelipeWeb.id, descricao: 'Prova 1', valor: 6.0, data: new Date('2024-09-10') },
    ],
  })

  // Gabriela — Web Full Stack (Aprovada: média 10.0)
  const mGabrielaWeb = await prisma.matricula.create({
    data: { alunoId: gabriela.id, cursoId: webFullStack.id, dataInicio: new Date('2024-02-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mGabrielaWeb.id, descricao: 'Prova 1', valor: 10.0, data: new Date('2024-03-10') },
      { matriculaId: mGabrielaWeb.id, descricao: 'Prova 2', valor: 10.0, data: new Date('2024-04-15') },
      { matriculaId: mGabrielaWeb.id, descricao: 'Trabalho Final', valor: 10.0, data: new Date('2024-06-20') },
    ],
  })

  // Gabriela — Python para Dados (Aprovada: média 8.8)
  const mGabrielaPython = await prisma.matricula.create({
    data: { alunoId: gabriela.id, cursoId: pythonDados.id, dataInicio: new Date('2024-03-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mGabrielaPython.id, descricao: 'Prova 1', valor: 9.0, data: new Date('2024-04-10') },
      { matriculaId: mGabrielaPython.id, descricao: 'Prova 2', valor: 8.5, data: new Date('2024-05-15') },
      { matriculaId: mGabrielaPython.id, descricao: 'Projeto Final', valor: 9.0, data: new Date('2024-07-01') },
    ],
  })

  // Hugo — Banco de Dados (Reprovado: média 3.2)
  const mHugoDB = await prisma.matricula.create({
    data: { alunoId: hugo.id, cursoId: bancoDados.id, dataInicio: new Date('2024-03-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mHugoDB.id, descricao: 'Prova 1', valor: 3.0, data: new Date('2024-04-10') },
      { matriculaId: mHugoDB.id, descricao: 'Prova 2', valor: 2.5, data: new Date('2024-05-15') },
      { matriculaId: mHugoDB.id, descricao: 'Projeto Final', valor: 4.0, data: new Date('2024-07-01') },
    ],
  })

  // Hugo — Python para Dados (Em andamento: média 5.8)
  const mHugoPython = await prisma.matricula.create({
    data: { alunoId: hugo.id, cursoId: pythonDados.id, dataInicio: new Date('2024-08-01') },
  })
  await prisma.nota.createMany({
    data: [
      { matriculaId: mHugoPython.id, descricao: 'Prova 1', valor: 6.0, data: new Date('2024-09-10') },
      { matriculaId: mHugoPython.id, descricao: 'Prova 2', valor: 5.5, data: new Date('2024-10-15') },
    ],
  })

  console.log('✅ Seed concluído!')
  console.log('   4 cursos | 8 alunos | 16 matrículas | 37 notas')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
