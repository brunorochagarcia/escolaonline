# Escola Online

Painel administrativo escolar para gestão de alunos, cursos, matrículas e notas. Construído com Next.js 15 App Router, TypeScript estrito, PostgreSQL + Prisma e autenticação via NextAuth v5.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15.3 (App Router · Server Actions · RSC) |
| Linguagem | TypeScript 5 (strict) |
| Banco de dados | PostgreSQL + Prisma ORM + `@prisma/adapter-pg` |
| Autenticação | NextAuth v5 beta (Credentials provider · JWT) |
| UI | Tailwind CSS v4 · Lucide React |
| Utilitários CSS | `clsx` + `tailwind-merge` via `cn()` |
| Toasts | Sonner |
| Validação | Zod |
| Formulários | React Hook Form + `@hookform/resolvers` |
| Upload de fotos | Cloudinary (planejado) |
| E-mail | Resend (planejado) |
| Exportação PDF | `@react-pdf/renderer` (planejado) |
| Exportação CSV | PapaParse |
| Testes | Vitest |

---

## Arquitetura

```
Browser
  └─ Server Components     ← busca direta no banco via Prisma, sem API intermediária
       └─ Client Components ← "use client" apenas onde há hooks / eventos de UI
            └─ Server Actions ← "use server" · requireAuth() · Zod · revalidatePath
                 └─ lib/api/*.ts  ← data access layer (queries Prisma isoladas)
                      └─ PostgreSQL
```

### Princípios aplicados

- **Server Components como padrão** — `"use client"` restrito a formulários, filtros e componentes com estado
- **Data fetching direto** — Server Components consultam o banco via Prisma sem criar rotas de API desnecessárias
- **Server Actions protegidas** — `requireAuth()` antes de qualquer mutação; lança `Error` se não autenticado
- **Única fonte de verdade** — tipos TypeScript inferidos dos schemas Zod com `z.infer<>`
- **Validação de fronteira** — todo dado externo passa por `safeParse()` antes de chegar ao banco
- **Env seguras** — variáveis de ambiente validadas com Zod em `src/lib/env.ts` na inicialização
- **Sem N+1** — relacionamentos carregados com `include` do Prisma em query única
- **Dados mínimos** — `select` explícito para evitar vazar campos sensíveis (ex: `senha`)
- **Split edge/node** — `auth.config.ts` (edge-safe, usado no middleware) separado de `auth.ts` (Node.js)
- **Estilos sem conflitos** — `cn()` (clsx + tailwind-merge) para composição dinâmica de classes

---

## Estrutura de Diretórios

```
/
├── auth.ts                    # NextAuth v5 — Credentials provider + bcrypt
├── auth.config.ts             # Configuração edge-runtime (middleware)
├── middleware.ts              # Proteção de rotas via NextAuth
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
└── src/
    ├── actions/               # Server Actions (mutações autenticadas)
    │   ├── alunos.ts          # criarAlunoAction · editarAlunoAction
    │   ├── auth.ts            # loginAction · logoutAction
    │   ├── cursos.ts          # criarCursoAction · editarCursoAction
    │   ├── matriculas.ts      # criarMatriculaAction · excluirMatriculaAction
    │   └── notas.ts           # lancarNotaAction · excluirNotaAction
    ├── app/                   # Next.js App Router
    │   ├── (auth)/login/      # Página de login (useActionState)
    │   ├── dashboard/         # Métricas agregadas
    │   ├── ranking/           # Ranking de alunos por média (RN-04)
    │   ├── alunos/
    │   │   ├── page.tsx       # Lista com busca em tempo real
    │   │   ├── novo/          # Cadastro
    │   │   └── [id]/
    │   │       ├── page.tsx   # Detalhes: cursos, notas, situações
    │   │       ├── boletim/   # Boletim individual com média geral
    │   │       └── editar/    # Edição
    │   ├── cursos/
    │   │   ├── page.tsx       # Lista com filtro de status
    │   │   ├── novo/
    │   │   └── [id]/
    │   │       ├── page.tsx   # Alunos matriculados + situações
    │   │       └── editar/
    │   ├── matriculas/
    │   │   ├── page.tsx       # Lista com filtro por curso
    │   │   ├── nova/
    │   │   └── [id]/notas/nova/
    │   └── api/
    │       ├── auth/[...nextauth]/  # Handlers NextAuth
    │       ├── ranking/             # GET — ranking JSON (stub 501)
    │       └── boletim/[id]/        # GET — PDF do boletim (stub 501)
    ├── components/
    │   ├── alunos/            # AlunoForm · AlunosClient
    │   ├── cursos/            # CursoForm · FiltroStatus
    │   ├── matriculas/        # MatriculaForm · FiltroCurso
    │   ├── notas/             # NotaForm
    │   └── shared/            # SituacaoBadge
    ├── lib/
    │   ├── api/               # Data access layer (queries Prisma)
    │   │   ├── alunos.ts      # listar · buscar · criar · editar · ranking · boletim
    │   │   ├── cursos.ts      # listar · buscar · criar · editar
    │   │   ├── matriculas.ts  # listar · criar (RN-03) · excluir
    │   │   └── notas.ts       # listar · lancar · excluir
    │   ├── auth-guard.ts      # requireAuth() — lança Error se não autenticado
    │   ├── env.ts             # Validação de env vars com Zod
    │   ├── prisma.ts          # Prisma client singleton
    │   └── utils/
    │       └── notas.ts       # calcularMedia · calcularMediaGeral · calcularSituacao
    └── schemas/               # Zod schemas — fonte de verdade para tipos
        ├── aluno.ts
        ├── curso.ts
        └── nota.ts
```

---

## Configuração

### Pré-requisitos

- Node.js 20+
- PostgreSQL

### 1. Clonar e instalar

```bash
git clone https://github.com/brunorochagarcia/escolaonline.git
cd escolaonline
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `AUTH_SECRET` | Segredo JWT — gere com `openssl rand -base64 32` |
| `CLOUDINARY_CLOUD_NAME` | Nome da cloud no Cloudinary |
| `CLOUDINARY_API_KEY` | Chave de API do Cloudinary |
| `CLOUDINARY_API_SECRET` | Segredo de API do Cloudinary |
| `RESEND_API_KEY` | Chave de API do Resend |

### 3. Banco de dados

```bash
npx prisma migrate dev
npx prisma db seed
```

O seed cria automaticamente:
- **Admin:** `admin@escolaonline.com` · senha `admin123`
- 4 cursos, 8 alunos, 16 matrículas e notas distribuídas (Aprovado / Reprovado / Em Andamento)

### 4. Rodar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 5. Testes

```bash
npm test          # roda uma vez
npm run test:watch # modo watch
```

---

## Modelo de Dados

```prisma
model User {
  id    String @id @default(cuid())
  nome  String
  email String @unique
  senha String          # hash bcrypt — nunca exposto via select
  role  Role   @default(ADMIN)
}

model Aluno {
  id             String      @id @default(cuid())
  nome           String
  email          String      @unique
  dataNascimento DateTime
  fotoUrl        String?     # URL pública no Cloudinary
  fotoPublicId   String?     # ID interno para exclusão no Cloudinary
  matriculas     Matricula[]
}

model Curso {
  id           String      @id @default(cuid())
  nome         String
  descricao    String
  cargaHoraria Int
  instrutor    String
  status       Status      @default(ATIVO)
  matriculas   Matricula[]
}

model Matricula {
  id         String   @id @default(cuid())
  alunoId    String
  cursoId    String
  dataInicio DateTime @default(now())
  aluno      Aluno    @relation(...)
  curso      Curso    @relation(...)
  notas      Nota[]
  @@unique([alunoId, cursoId])  # RN-03: sem matrícula duplicada
}

model Nota {
  id          String    @id @default(cuid())
  matriculaId String
  descricao   String
  valor       Float     # 0.0 – 10.0
  data        DateTime  @default(now())
  matricula   Matricula @relation(...)
}
```

---

## Regras de Negócio

| # | Regra | Implementação |
|---|---|---|
| RN-01 | Média aritmética simples das notas lançadas | `calcularMedia(valores: number[])` em `src/lib/utils/notas.ts` |
| RN-02 | Aprovado ≥ 7.0 · Reprovado < 5.0 · Em Andamento: 5.0–6.9 ou sem notas | `calcularSituacao(media: number \| null)` |
| RN-03 | Aluno só pode ser matriculado uma vez no mesmo curso | `@@unique([alunoId, cursoId])` + `MatriculaDuplicadaError` |
| RN-04 | Ranking considera apenas alunos com ao menos uma nota lançada | `where: { matriculas: { some: { notas: { some: {} } } } }` na query |

Todas as regras têm cobertura de testes com Vitest (`src/lib/utils/notas.test.ts`, `src/lib/api/alunos.test.ts`, `src/lib/api/matriculas.test.ts`).

---

## Status de Implementação

### Concluído

- [x] CRUD completo de cursos (listar, criar, editar, detalhar com alunos e situações)
- [x] CRUD completo de alunos (listar com busca, criar, editar)
- [x] Gestão de matrículas (criar com validação de duplicata RN-03, listar com filtro, excluir)
- [x] Lançamento e exclusão de notas por módulo/avaliação
- [x] Página de detalhes do aluno com cursos, notas e situação por curso
- [x] Boletim individual (`/alunos/[id]/boletim`) com média geral calculada
- [x] Dashboard com métricas reais (total alunos, cursos ativos, matrículas, média geral)
- [x] Página de ranking de alunos com posição ordinal, medalhas e link para boletim (RN-04)
- [x] Autenticação com NextAuth v5 (Credentials provider + bcrypt)
- [x] Split `auth.config.ts` (edge) / `auth.ts` (Node.js)
- [x] Middleware de proteção de todas as rotas exceto `/login`
- [x] `requireAuth()` em todas as Server Actions (lança erro, não redireciona)
- [x] Validação Zod em todas as fronteiras (inputs + env vars)
- [x] Tratamento de erros de banco (`P2002` — e-mail/matrícula duplicada)
- [x] Testes unitários e de integração (RN-01 a RN-04, casos de borda)
- [x] Seed com dados realistas de exemplo

### Pendente

- [ ] `src/lib/cloudinary.ts` — `uploadImagem()` e `deletarImagemCloudinary(publicId)`
- [ ] Upload de foto no cadastro de aluno com rollback se DB falhar
- [ ] `GET /api/ranking` — JSON do ranking (stub 501)
- [ ] `GET /api/boletim/[id]` — PDF do boletim via `@react-pdf/renderer` (stub 501)
- [ ] Envio de e-mail via Resend quando nota for lançada
- [ ] `onDelete: Cascade` nas relações Matricula→Aluno, Matricula→Curso, Nota→Matricula
