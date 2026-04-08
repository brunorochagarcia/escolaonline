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
| Upload de fotos | Cloudinary |
| E-mail | Resend |
| Exportação PDF | `@react-pdf/renderer` (server-side) |
| Exportação CSV | PapaParse |

---

## Arquitetura

```
Browser
  └─ Server Components     ← busca direta no banco via Prisma, sem API intermediária
       └─ Client Components ← "use client" apenas onde há hooks / eventos de UI
            └─ Server Actions ← "use server" · requireAuth() · Zod · revalidatePath
                 └─ Prisma ORM
                      └─ PostgreSQL
```

### Princípios aplicados

- **Server Components como padrão** — `"use client"` restrito a formulários, filtros e componentes com estado
- **Data fetching direto** — Server Components consultam o banco via Prisma sem criar rotas de API desnecessárias
- **Server Actions protegidas** — `requireAuth()` é chamado antes de qualquer lógica de mutação
- **Única fonte de verdade** — tipos TypeScript inferidos dos schemas Zod com `z.infer<>`
- **Validação de fronteira** — todo dado externo passa por `safeParse()` antes de chegar ao banco
- **Env seguras** — todas as variáveis de ambiente validadas com Zod em `src/lib/env.ts` na inicialização
- **Sem N+1** — relacionamentos carregados com `include` do Prisma em query única
- **Dados mínimos** — `select` explícito para evitar vazar campos sensíveis (ex: `senha`)
- **Estilos sem conflitos** — `cn()` (clsx + tailwind-merge) para composição dinâmica de classes

---

## Estrutura de Diretórios

```
/
├── auth.ts                    # NextAuth v5 — Credentials provider + bcrypt
├── auth.config.ts             # Configuração edge-runtime (middleware)
├── middleware.ts              # Proteção de rotas
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
└── src/
    ├── actions/               # Server Actions (mutações)
    │   ├── alunos.ts          # criarAlunoAction · editarAlunoAction
    │   ├── cursos.ts          # criarCursoAction · editarCursoAction
    │   ├── matriculas.ts      # criarMatriculaAction · excluirMatriculaAction
    │   └── notas.ts           # lancarNotaAction · excluirNotaAction
    ├── app/                   # Next.js App Router
    │   ├── (auth)/login/      # Página de login
    │   ├── dashboard/         # Dashboard com métricas
    │   ├── alunos/
    │   │   ├── page.tsx       # Lista com busca em tempo real
    │   │   ├── novo/          # Cadastro
    │   │   └── [id]/
    │   │       ├── page.tsx   # Boletim do aluno
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
    │       ├── ranking/       # GET — ranking de alunos por média
    │       └── boletim/[id]/  # GET — exportação do boletim
    ├── components/
    │   ├── alunos/            # AlunoForm · AlunosClient
    │   ├── cursos/            # CursoForm · FiltroStatus
    │   ├── matriculas/        # MatriculaForm · FiltroCurso
    │   └── notas/             # NotaForm
    ├── lib/
    │   ├── api/               # Data access layer (queries Prisma)
    │   │   ├── alunos.ts
    │   │   ├── cursos.ts
    │   │   ├── matriculas.ts
    │   │   └── notas.ts
    │   ├── auth-guard.ts      # requireAuth() — proteção de Server Actions
    │   ├── env.ts             # Validação de env vars com Zod
    │   ├── prisma.ts          # Prisma client singleton
    │   └── utils.ts           # cn() · calcularMedia · calcularSituacao
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
# Executar as migrations
npx prisma migrate dev

# Popular com dados de exemplo
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

| # | Regra |
|---|---|
| RN-01 | Média = média aritmética simples das notas lançadas |
| RN-02 | Aprovado ≥ 7.0 · Reprovado < 5.0 · Em Andamento: 5.0–6.9 ou sem notas |
| RN-03 | Aluno só pode ser matriculado uma vez no mesmo curso (constraint `@@unique`) |
| RN-04 | Ranking considera apenas alunos com ao menos uma nota lançada |

---

## Status de Implementação

### Concluído

- [x] CRUD completo de cursos (listar, criar, editar, detalhar)
- [x] CRUD completo de alunos (listar com busca, criar, editar)
- [x] Gestão de matrículas (criar com validação de duplicata, listar com filtro, excluir)
- [x] Lançamento e exclusão de notas por módulo/avaliação
- [x] Página de detalhes do curso com alunos matriculados e situações
- [x] Autenticação com NextAuth v5 (Credentials provider + bcrypt)
- [x] `requireAuth()` em todas as Server Actions
- [x] Validação Zod em todas as fronteiras (inputs + env vars)
- [x] Tratamento de erros de banco (`P2002` — email/matrícula duplicada)
- [x] `cn()` com clsx + tailwind-merge
- [x] Seed com dados realistas de exemplo

### Em desenvolvimento

- [ ] Página de detalhes do aluno — boletim individual com todas as notas
- [ ] Dashboard — métricas agregadas (total de alunos, cursos, média geral)
- [ ] Página de login
- [ ] Middleware de proteção de rotas (`middleware.ts`)
- [ ] `GET /api/ranking` — ranking de alunos por média (RN-04)
- [ ] `GET /api/boletim/[id]` — exportação PDF do boletim
- [ ] Upload de foto para Cloudinary com lógica de compensação
- [ ] Envio de alertas por e-mail via Resend