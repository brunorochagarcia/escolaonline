import { PrismaClient, Status } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ── PRNG determinístico (Mulberry32) ─────────────────────────────────────────
function makePRNG(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = makePRNG(42)
const rand = () => rng()
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const randFloat = (min: number, max: number) => parseFloat((rand() * (max - min) + min).toFixed(2))
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

// ── Dados base ────────────────────────────────────────────────────────────────
const PRIMEIROS_NOMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Felipe', 'Gabriela', 'Hugo',
  'Isabela', 'João', 'Karla', 'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Pedro',
  'Quézia', 'Rafael', 'Sabrina', 'Thiago', 'Ursula', 'Victor', 'Wanda', 'Xavier',
  'Yasmin', 'Zé',
]

const SOBRENOMES = [
  'Alves', 'Barbosa', 'Cardoso', 'Castro', 'Costa', 'Cruz', 'Dias', 'Ferreira',
  'Gomes', 'Lima', 'Lopes', 'Martins', 'Medeiros', 'Melo', 'Miranda', 'Moraes',
  'Moreira', 'Nascimento', 'Nunes', 'Oliveira', 'Pereira', 'Pinto', 'Reis', 'Ribeiro',
  'Rocha', 'Rodrigues', 'Santos', 'Silva', 'Sousa', 'Souza', 'Teixeira', 'Torres',
]

const DESCRICOES_NOTAS = [
  'Prova 1', 'Prova 2', 'Prova 3', 'Prova Final',
  'Trabalho Final', 'Projeto', 'Atividade 1', 'Atividade 2',
  'Seminário', 'Apresentação', 'Exercício Prático',
]

const CURSOS_DATA = [
  { nome: 'Desenvolvimento Web Full Stack', descricao: 'HTML, CSS, JavaScript, React e Node.js do zero ao avançado.', cargaHoraria: 120, instrutor: 'Rafael Mendes', status: Status.ATIVO },
  { nome: 'Python para Dados', descricao: 'Introdução a Python com foco em análise de dados, Pandas e visualização.', cargaHoraria: 80, instrutor: 'Camila Rocha', status: Status.ATIVO },
  { nome: 'UX/UI Design', descricao: 'Fundamentos de design de interfaces, prototipação e usabilidade.', cargaHoraria: 60, instrutor: 'Fernanda Lima', status: Status.ATIVO },
  { nome: 'Banco de Dados Relacional', descricao: 'SQL avançado, modelagem relacional, índices e otimização de queries.', cargaHoraria: 40, instrutor: 'Marcos Oliveira', status: Status.INATIVO },
  { nome: 'Machine Learning com Python', descricao: 'Algoritmos de aprendizado supervisionado e não supervisionado com scikit-learn.', cargaHoraria: 100, instrutor: 'Beatriz Souza', status: Status.ATIVO },
  { nome: 'DevOps e Cloud', descricao: 'Docker, Kubernetes, CI/CD e serviços AWS para times de desenvolvimento.', cargaHoraria: 90, instrutor: 'André Figueiredo', status: Status.ATIVO },
  { nome: 'Mobile com React Native', descricao: 'Desenvolvimento de apps iOS e Android com React Native e Expo.', cargaHoraria: 80, instrutor: 'Juliana Pires', status: Status.ATIVO },
  { nome: 'Segurança da Informação', descricao: 'Criptografia, OWASP Top 10, pentest e boas práticas de segurança.', cargaHoraria: 70, instrutor: 'Carlos Ventura', status: Status.ATIVO },
  { nome: 'Gestão de Projetos Ágeis', descricao: 'Scrum, Kanban, OKRs e ferramentas para equipes de alto desempenho.', cargaHoraria: 50, instrutor: 'Letícia Campos', status: Status.ATIVO },
  { nome: 'Inteligência Artificial Aplicada', descricao: 'LLMs, embeddings, RAG e integração de IA em produtos reais.', cargaHoraria: 110, instrutor: 'Roberto Azevedo', status: Status.INATIVO },
]

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Iniciando seed...')

  await prisma.nota.deleteMany()
  await prisma.matricula.deleteMany()
  await prisma.aluno.deleteMany()
  await prisma.curso.deleteMany()
  await prisma.user.deleteMany()

  // Usuários de teste — criados sequencialmente para obter o id do professor
  await prisma.user.create({
    data: {
      nome: 'Administrador',
      email: 'admin@escolaonline.com.br',
      senha: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  })

  const professor = await prisma.user.create({
    data: {
      nome: 'Carlos Ventura',
      email: 'carlosventura@escolaonline.com.br',
      senha: await bcrypt.hash('carlos123', 10),
      role: 'PROFESSOR',
    },
  })

  await prisma.user.create({
    data: {
      nome: 'Maria Souza',
      email: 'mariasouza@escolaonline.com.br',
      senha: await bcrypt.hash('maria123', 10),
      role: 'ALUNO',
    },
  })

  // Cursos — "Segurança da Informação" pertence ao professor de teste
  const cursos = await Promise.all(
    CURSOS_DATA.map((d) =>
      prisma.curso.create({
        data: {
          ...d,
          instrutorId: d.instrutor === 'Carlos Ventura' ? professor.id : null,
        },
      }),
    ),
  )
  console.log(`   ✓ ${cursos.length} cursos criados`)

  // ── Perfis de teste vinculados aos logins ─────────────────────────────────────

  // Perfil Aluno: mesmo e-mail do login → permite "editar próprio perfil"
  const alunoTeste = await prisma.aluno.create({
    data: {
      nome: 'Maria Souza',
      email: 'mariasouza@escolaonline.com.br',
      dataNascimento: new Date('2000-03-15'),
    },
  })

  // Perfil Professor: aluno no sistema também (para aparecer no ranking/boletim)
  const professorAluno = await prisma.aluno.create({
    data: {
      nome: 'Carlos Ventura',
      email: 'carlosventura@escolaonline.com.br',
      dataNascimento: new Date('1985-07-22'),
    },
  })

  // Matrículas e notas fixas para os perfis de teste
  const cursoSeguranca = cursos.find((c) => c.instrutor === 'Carlos Ventura')!
  const cursoWeb       = cursos.find((c) => c.nome.includes('Web'))!

  // Maria Souza — matriculada em Segurança e Web com notas variadas
  for (const [curso, notas] of [
    [cursoSeguranca, [{ descricao: 'Prova 1', valor: 8.5 }, { descricao: 'Prova 2', valor: 7.0 }, { descricao: 'Projeto', valor: 9.0 }]],
    [cursoWeb,       [{ descricao: 'Prova 1', valor: 6.5 }, { descricao: 'Trabalho Final', valor: 8.0 }]],
  ] as const) {
    const matricula = await prisma.matricula.create({
      data: { alunoId: alunoTeste.id, cursoId: curso.id, dataInicio: new Date('2024-02-01') },
    })
    await prisma.nota.createMany({
      data: notas.map((n, i) => ({
        matriculaId: matricula.id,
        descricao: n.descricao,
        valor: n.valor,
        data: addDays(new Date('2024-02-01'), 30 + i * 30),
      })),
    })
  }

  // Carlos Ventura — matriculado em Web e Python (como aluno)
  for (const [curso, notas] of [
    [cursoWeb, [{ descricao: 'Prova Final', valor: 9.5 }, { descricao: 'Seminário', valor: 8.8 }]],
    [cursos.find((c) => c.nome.includes('Python'))!, [{ descricao: 'Atividade 1', valor: 7.5 }]],
  ] as const) {
    const matricula = await prisma.matricula.create({
      data: { alunoId: professorAluno.id, cursoId: curso.id, dataInicio: new Date('2023-08-01') },
    })
    await prisma.nota.createMany({
      data: notas.map((n, i) => ({
        matriculaId: matricula.id,
        descricao: n.descricao,
        valor: n.valor,
        data: addDays(new Date('2023-08-01'), 30 + i * 30),
      })),
    })
  }

  console.log('   ✓ perfis de teste vinculados (Maria Souza · Carlos Ventura)')

  // Alunos (100)
  const alunosData = Array.from({ length: 100 }, (_, i) => {
    const nome = `${pick(PRIMEIROS_NOMES)} ${pick(SOBRENOMES)}`
    const slug = nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '.')
    const anoNasc = randInt(1985, 2005)
    const mesNasc = randInt(1, 12)
    const diaNasc = randInt(1, 28)
    return {
      nome,
      email: `${slug}.${i + 1}@email.com`,
      dataNascimento: new Date(`${anoNasc}-${String(mesNasc).padStart(2, '0')}-${String(diaNasc).padStart(2, '0')}`),
    }
  })

  const alunos = await Promise.all(alunosData.map((d) => prisma.aluno.create({ data: d })))
  console.log(`   ✓ ${alunos.length} alunos criados`)

  // Matrículas e Notas
  let totalMatriculas = 0
  let totalNotas = 0

  for (const aluno of alunos) {
    const qtdCursos = randInt(1, 4)
    const cursosSelecionados = shuffle(cursos).slice(0, qtdCursos)

    for (const curso of cursosSelecionados) {
      const anoInicio = randInt(2023, 2024)
      const mesInicio = randInt(1, 10)
      const dataInicio = new Date(`${anoInicio}-${String(mesInicio).padStart(2, '0')}-01`)

      const matricula = await prisma.matricula.create({
        data: { alunoId: aluno.id, cursoId: curso.id, dataInicio },
      })
      totalMatriculas++

      // 15% das matrículas ficam sem nota (recém inscritos)
      if (rand() < 0.15) continue

      const qtdNotas = randInt(1, 4)
      const descricoesUsadas = shuffle(DESCRICOES_NOTAS).slice(0, qtdNotas)

      const notasData = descricoesUsadas.map((descricao, idx) => ({
        matriculaId: matricula.id,
        descricao,
        valor: randFloat(2.0, 10.0),
        data: addDays(dataInicio, randInt(30 + idx * 30, 60 + idx * 40)),
      }))

      await prisma.nota.createMany({ data: notasData })
      totalNotas += notasData.length
    }
  }

  console.log(`   ✓ ${totalMatriculas} matrículas criadas`)
  console.log(`   ✓ ${totalNotas} notas criadas`)
  console.log('✅ Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
