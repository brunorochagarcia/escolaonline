# PRD — Escola Online

> Documento de Requisitos de Produto atualizado para refletir o estado atual da implementação.
> O prompt original está preservado em `Prompt 1 - Inicial`.

---

## 1. Visão Geral

**Nome:** Escola Online
**Tipo:** Aplicação Web — Painel Administrativo Escolar
**Objetivo:** Digitalizar e centralizar o controle de notas de alunos, oferecendo registro por avaliação, boletim individual exportável, dashboard com visão agregada e alertas por e-mail.

---

## 2. Contexto e Problema

Gestores escolares precisam de um sistema centralizado para registrar matrículas, lançar notas e acompanhar o desempenho dos alunos por curso. O sistema substitui planilhas manuais e elimina retrabalho na geração de relatórios.

---

## 3. Usuários e Papéis

| Papel | Descrição |
|---|---|
| Administrador | Único perfil ativo. Gerencia alunos, cursos, matrículas e notas. |
| Responsável | Não acessa o sistema. Recebe alertas por e-mail (a implementar). |

**Autenticação:**
- NextAuth v5 com Credentials provider (e-mail + senha)
- Senha armazenada com `bcrypt` (nunca exposta via `select` no Prisma)
- Sessão JWT — sem persistência em banco
- Modelo `User` com campo `role` preparado para múltiplos perfis futuros
- Todas as rotas internas protegidas via `middleware.ts` (a configurar)
- Server Actions protegidas individualmente por `requireAuth()` antes de qualquer lógica

---

## 4. Regras de Negócio

| # | Regra | Implementação |
|---|---|---|
| RN-01 | Média aritmética simples das notas lançadas | `calcularMedia()` em `src/lib/utils/notas.ts` |
| RN-02 | Aprovado ≥ 7.0 · Reprovado < 5.0 · Em Andamento: 5.0–6.9 ou sem notas | `calcularSituacao()` em `src/lib/utils/notas.ts` |
| RN-03 | Aluno só pode ser matriculado uma vez no mesmo curso | `@@unique([alunoId, cursoId])` no schema + `MatriculaDuplicadaError` na action |
| RN-04 | Ranking considera apenas alunos com ao menos uma nota lançada | Filtro na query de `/api/ranking` (a implementar) |

---

## 5. Requisitos Funcionais

| # | Requisito | Status |
|---|---|---|
| RF01 | Cadastro de cursos: nome, descrição, carga horária, instrutor, status | Concluído |
| RF02 | Cadastro de alunos: nome, e-mail, data de nascimento, foto opcional | Concluído |
| RF03 | Matrícula de aluno em curso com data de início | Concluído |
| RF04 | Lançamento de notas por módulo/avaliação (0–10) | Concluído |
| RF05 | Boletim individual: cursos matriculados, notas, média, situação | Em desenvolvimento |
| RF06 | Ranking geral de alunos ordenado por média | Em desenvolvimento |
| RF07 | Página de detalhes do curso com alunos matriculados e situações | Concluído |

---

## 6. Requisitos Não Funcionais

| # | Requisito | Decisão de implementação |
|---|---|---|
| RNF01 | TypeScript estrito sem `any` | `strict: true` no `tsconfig.json` |
| RNF02 | Validação em todas as fronteiras | Zod `safeParse()` em cada Server Action e `parse()` no `env.ts` |
| RNF03 | Dados sensíveis nunca expostos | `select` explícito no Prisma; `senha` nunca retornada |
| RNF04 | Sem queries N+1 | `include` do Prisma para buscar relacionamentos em query única |
| RNF05 | PDF e e-mail exclusivamente server-side | `@react-pdf/renderer` via Route Handler; `Resend` em Server Action |
| RNF06 | Compensação de falhas em uploads | Se `criarAluno` falhar após upload no Cloudinary, deletar via `fotoPublicId` |
| RNF07 | Variáveis de ambiente validadas no startup | `envSchema.parse(process.env)` em `src/lib/env.ts` |

---

## 7. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js App Router (Server Actions · RSC) | 15.3 |
| Linguagem | TypeScript strict | 5 |
| Banco de dados | PostgreSQL + Prisma ORM + `@prisma/adapter-pg` | latest |
| Autenticação | NextAuth (Credentials · JWT) | v5 beta |
| UI | Tailwind CSS | v4 |
| Composição de classes | clsx + tailwind-merge (`cn()`) | 2 / 3 |
| Ícones | Lucide React | 0.511 |
| Toasts | Sonner | 2 |
| Validação | Zod | 3.24 |
| Formulários | React Hook Form + `@hookform/resolvers` | 7.72 / 5.2 |
| Upload de fotos | Cloudinary | — |
| E-mail | Resend | 4 |
| Exportação PDF | `@react-pdf/renderer` (server-side) | 4.3 |
| Exportação CSV | PapaParse | 5.5 |

> **Divergência do prompt original:** O prompt inicial listava `shadcn/ui`. A implementação usa Tailwind CSS v4 diretamente com componentes customizados para manter controle total sobre o design sem dependência de uma biblioteca de componentes de terceiros.

---

## 8. Modelo de Dados

```prisma
enum Role   { ADMIN }
enum Status { ATIVO · INATIVO }

User        id · nome · email (unique) · senha (bcrypt) · role
Aluno       id · nome · email (unique) · dataNascimento · fotoUrl? · fotoPublicId?
Curso       id · nome · descricao · cargaHoraria · instrutor · status
Matricula   id · alunoId → Aluno · cursoId → Curso · dataInicio
            @@unique([alunoId, cursoId])
Nota        id · matriculaId → Matricula · descricao · valor (0–10) · data
```

**Alterações em relação ao schema original:**
- Removido `matricula` (campo string) e `turmaId` do modelo `Aluno` — substituídos pelo modelo `Matricula`
- Removido `emailResponsavel` do `Aluno` — responsáveis receberão alertas sem precisar de cadastro
- Removido `anoLetivo` do `Curso` — escopo simplificado
- Adicionado `fotoPublicId` ao `Aluno` para controle de exclusão no Cloudinary
- `Status` do `Curso` com default `ATIVO`

---

## 9. Arquitetura e Padrões

### Fluxo de dados

```
Navegador
  └─ Server Component          # busca dados direto no banco, sem rota API
       ├─ Client Component     # "use client" — filtros, busca, formulários
       └─ Server Action        # "use server" — mutações autenticadas e validadas
            └─ lib/api/*.ts    # data access layer (queries Prisma isoladas)
                 └─ PostgreSQL
```

### Padrões implementados

| Padrão | Onde |
|---|---|
| `requireAuth()` antes de qualquer mutação | Todas as Server Actions |
| `z.infer<typeof schema>` como único tipo | `src/schemas/*.ts` → actions e components |
| `id` passado via `.bind(null, id)` — sem campo hidden | Páginas de edição |
| Erros de negócio tipados (`AlunoActionResult`, `MatriculaActionState`) | Actions → Formulários |
| `select` explícito para queries de formulário | `buscarAlunoParaEdicao()` vs `buscarAlunoPorId()` |
| `cn()` para variantes de classe sem conflito | Todos os componentes de formulário |
| `try/catch` com `Prisma.PrismaClientKnownRequestError` `P2002` | Actions que podem violar unique constraints |
| Exportações PDF e e-mail 100% server-side | Route Handlers e Server Actions |
| `envSchema.parse(process.env)` no módulo, não lazy | `src/lib/env.ts` |

---

## 10. Estrutura de Páginas

| Rota | Tipo | Descrição |
|---|---|---|
| `/login` | Client | Formulário de autenticação |
| `/dashboard` | Server | Métricas: total alunos, cursos, matrículas, médias |
| `/alunos` | Server + Client | Lista com busca em tempo real |
| `/alunos/novo` | Server (form Client) | Cadastro de aluno |
| `/alunos/[id]` | Server | Boletim individual |
| `/alunos/[id]/editar` | Server (form Client) | Edição de aluno |
| `/cursos` | Server + Client | Lista com filtro por status |
| `/cursos/novo` | Server (form Client) | Cadastro de curso |
| `/cursos/[id]` | Server | Detalhes do curso + alunos matriculados |
| `/cursos/[id]/editar` | Server (form Client) | Edição de curso |
| `/matriculas` | Server + Client | Lista com filtro por curso |
| `/matriculas/nova` | Server (form Client) | Nova matrícula |
| `/matriculas/[id]/notas/nova` | Server (form Client) | Lançamento de nota |
| `GET /api/ranking` | Route Handler | JSON com ranking de alunos por média |
| `GET /api/boletim/[id]` | Route Handler | PDF do boletim individual |

---

## 11. Integrações Externas

### Cloudinary — Upload de fotos

- Upload feito server-side antes de persistir o aluno
- `fotoUrl` armazena a URL pública; `fotoPublicId` armazena o ID para exclusão
- **Lógica de compensação:** se `criarAluno()` falhar após o upload, a foto é deletada no Cloudinary via `fotoPublicId` para evitar arquivos órfãos

### Resend — E-mail

- Envio exclusivamente em Server Actions (chave de API nunca exposta ao cliente)
- Alertas automáticos ao responsável quando nota for lançada (a implementar)

### @react-pdf/renderer — PDF

- `renderToBuffer()` executado no Route Handler (`/api/boletim/[id]`)
- Resposta com `Content-Type: application/pdf` e `Content-Disposition: attachment`

---

## 12. Ambiente e Segurança

```env
DATABASE_URL         # URL PostgreSQL
AUTH_SECRET          # Segredo JWT (openssl rand -base64 32)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY
NODE_ENV             # development | test | production (default: development)
```

Todas validadas com Zod em `src/lib/env.ts` — a aplicação falha no startup se alguma estiver ausente em produção.