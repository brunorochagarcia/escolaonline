# PRD — Escola Online

> Documento de Requisitos de Produto atualizado para refletir o estado atual da implementação.
> O prompt original está preservado em `Prompt 1 - Inicial`.

---

## 1. Visão Geral

**Nome:** Escola Online
**Tipo:** Aplicação Web — Painel Administrativo Escolar
**Objetivo:** Digitalizar e centralizar o controle de notas de alunos, oferecendo registro por avaliação, boletim individual, dashboard com visão agregada, ranking de desempenho e alertas por e-mail.

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
- `auth.config.ts` edge-safe (usado no middleware) separado de `auth.ts` (Node.js)
- Todas as rotas internas protegidas via `middleware.ts`
- Server Actions protegidas por `requireAuth()` — lança `Error('Não autenticado')` em vez de redirecionar, para que testes unitários possam capturar a falha sem depender de navegação

---

## 4. Regras de Negócio

| # | Regra | Implementação | Testes |
|---|---|---|---|
| RN-01 | Média aritmética simples das notas lançadas | `calcularMedia(valores: number[])` em `src/lib/utils/notas.ts` | `notas.test.ts` |
| RN-02 | Aprovado ≥ 7.0 · Reprovado < 5.0 · Em Andamento: 5.0–6.9 ou sem notas | `calcularSituacao(media: number \| null)` | `notas.test.ts` |
| RN-03 | Aluno só pode ser matriculado uma vez no mesmo curso | `@@unique([alunoId, cursoId])` no schema + `MatriculaDuplicadaError` capturada na action | `matriculas.test.ts` |
| RN-04 | Ranking considera apenas alunos com ao menos uma nota lançada | `where: { matriculas: { some: { notas: { some: {} } } } }` na query Prisma | `alunos.test.ts` |

**Assinaturas de função (testáveis unitariamente):**

```typescript
calcularMedia(valores: number[]): number | null
calcularMediaGeral(matriculas: { notas: { valor: number }[] }[]): number | null
calcularSituacao(media: number | null): 'Aprovado' | 'Reprovado' | 'Em Andamento'
```

---

## 5. Requisitos Funcionais

| # | Requisito | Status |
|---|---|---|
| RF01 | Cadastro de cursos: nome, descrição, carga horária, instrutor, status | Concluído |
| RF02 | Cadastro de alunos: nome, e-mail, data de nascimento, foto opcional | Concluído |
| RF03 | Matrícula de aluno em curso com data de início | Concluído |
| RF04 | Lançamento de notas por módulo/avaliação (0–10) | Concluído |
| RF05 | Boletim individual: cursos matriculados, notas, média, situação | Concluído |
| RF06 | Ranking geral de alunos ordenado por média, com posição ordinal | Concluído |
| RF07 | Página de detalhes do curso com alunos matriculados e situações | Concluído |
| RF08 | Dashboard com métricas: total alunos, cursos ativos, matrículas, média geral | Concluído |
| RF09 | Exportação PDF do boletim individual | Pendente |
| RF10 | Endpoint JSON do ranking (`GET /api/ranking`) | Pendente |
| RF11 | Upload de foto de perfil do aluno via Cloudinary | Pendente |
| RF12 | Alerta por e-mail ao responsável quando nota for lançada | Pendente |

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
| RNF08 | Regras de negócio testáveis sem banco | Funções puras em `src/lib/utils/notas.ts`; DAL mockável via `vi.mock` |
| RNF09 | Cascata referencial no banco | `onDelete: Cascade` a adicionar em Matricula→Aluno, Matricula→Curso, Nota→Matricula |

---

## 7. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js App Router (Server Actions · RSC) | 15.3 |
| Linguagem | TypeScript strict | 5 |
| Banco de dados | PostgreSQL + Prisma ORM + `@prisma/adapter-pg` | latest |
| Autenticação | NextAuth (Credentials · JWT) | v5 beta |
| UI | Tailwind CSS (sem shadcn/ui — componentes customizados) | v4 |
| Composição de classes | clsx + tailwind-merge (`cn()`) | 2 / 3 |
| Ícones | Lucide React | 0.511 |
| Toasts | Sonner | 2 |
| Validação | Zod | 3.24 |
| Formulários | React Hook Form + `@hookform/resolvers` | 7.72 / 5.2 |
| Upload de fotos | Cloudinary | 2.9 |
| E-mail | Resend | 4 |
| Exportação PDF | `@react-pdf/renderer` (server-side) | 4.3 |
| Exportação CSV | PapaParse | 5.5 |
| Testes | Vitest | 4.1 |

> **Divergência do prompt original:** O prompt inicial listava `shadcn/ui`. A implementação usa Tailwind CSS v4 diretamente com componentes customizados para manter controle total sobre o design sem dependência de biblioteca de componentes externa.

---

## 8. Modelo de Dados

```
User        id · nome · email (unique) · senha (bcrypt) · role
Aluno       id · nome · email (unique) · dataNascimento · fotoUrl? · fotoPublicId?
Curso       id · nome · descricao · cargaHoraria · instrutor · status
Matricula   id · alunoId → Aluno · cursoId → Curso · dataInicio
            @@unique([alunoId, cursoId])
            onDelete: Cascade (a adicionar)
Nota        id · matriculaId → Matricula · descricao · valor (0–10) · data
            onDelete: Cascade (a adicionar)
```

**Alterações em relação ao schema original do prompt:**
- Removido `matricula` (campo string) e `turmaId` do modelo `Aluno`
- Removido `emailResponsavel` do `Aluno` — responsáveis receberão alertas sem precisar de cadastro
- Removido `anoLetivo` do `Curso` — escopo simplificado
- Adicionado `fotoPublicId` ao `Aluno` para controle de exclusão no Cloudinary

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

### Padrões aplicados

| Padrão | Onde |
|---|---|
| `requireAuth()` lança `Error` (não redireciona) | Todas as Server Actions |
| `z.infer<typeof schema>` como único tipo | `src/schemas/*.ts` → actions e components |
| `id` passado via `.bind(null, id)` — sem campo hidden | Páginas de edição |
| `select` explícito para queries de formulário (sem over-fetch) | `buscarAlunoParaEdicao()` · `buscarCursoParaEdicao()` |
| `try/catch` com `Prisma.PrismaClientKnownRequestError` `P2002` | Actions que podem violar unique constraints |
| Funções puras de cálculo desacopladas do banco | `src/lib/utils/notas.ts` |
| Media geral flat (ponderada por quantidade de notas) | Boletim e ranking — mesma função `calcularMediaGeral` |
| `vi.mock('@/lib/prisma')` para isolar DAL nos testes | `*.test.ts` |
| Split `auth.config.ts` (edge) / `auth.ts` (Node.js) | Middleware vs Server Actions |
| `envSchema.parse(process.env)` no módulo | `src/lib/env.ts` |

---

## 10. Estrutura de Páginas

| Rota | Tipo | Descrição | Status |
|---|---|---|---|
| `/login` | Client | Formulário de autenticação (`useActionState`) | Concluído |
| `/dashboard` | Server | Métricas: total alunos, cursos, matrículas, médias | Concluído |
| `/alunos` | Server + Client | Lista com busca em tempo real | Concluído |
| `/alunos/novo` | Server (form Client) | Cadastro de aluno | Concluído |
| `/alunos/[id]` | Server | Detalhes: cursos, notas, situações | Concluído |
| `/alunos/[id]/boletim` | Server | Boletim individual com média geral | Concluído |
| `/alunos/[id]/editar` | Server (form Client) | Edição de aluno | Concluído |
| `/cursos` | Server + Client | Lista com filtro por status | Concluído |
| `/cursos/novo` | Server (form Client) | Cadastro de curso | Concluído |
| `/cursos/[id]` | Server | Detalhes do curso + alunos matriculados | Concluído |
| `/cursos/[id]/editar` | Server (form Client) | Edição de curso | Concluído |
| `/matriculas` | Server + Client | Lista com filtro por curso | Concluído |
| `/matriculas/nova` | Server (form Client) | Nova matrícula | Concluído |
| `/matriculas/[id]/notas/nova` | Server (form Client) | Lançamento de nota | Concluído |
| `/ranking` | Server | Ranking de alunos com posição e medalhas | Concluído |
| `GET /api/ranking` | Route Handler | JSON com ranking por média (RN-04) | Pendente (501) |
| `GET /api/boletim/[id]` | Route Handler | PDF do boletim individual | Pendente (501) |

---

## 11. Integrações Externas

### Cloudinary — Upload de fotos (pendente)

- Upload feito server-side antes de persistir o aluno
- `fotoUrl` armazena a URL pública; `fotoPublicId` armazena o ID para exclusão
- **Lógica de compensação:** se `criarAluno()` falhar após o upload, a foto é deletada via `deletarImagemCloudinary(fotoPublicId)` para evitar arquivos órfãos
- Requer criação de `src/lib/cloudinary.ts` com `uploadImagem()` e `deletarImagemCloudinary()`

### Resend — E-mail (pendente)

- Envio exclusivamente em Server Actions (chave de API nunca exposta ao cliente)
- Alertas ao responsável quando nota for lançada

### @react-pdf/renderer — PDF (pendente)

- `renderToBuffer()` no Route Handler `GET /api/boletim/[id]`
- Resposta com `Content-Type: application/pdf` e `Content-Disposition: attachment`

---

## 12. Testes

Cobertura com Vitest (testes unitários e de integração com Prisma mockado):

| Arquivo | Cobertura |
|---|---|
| `src/lib/utils/notas.test.ts` | RN-01 (calcularMedia · calcularMediaGeral) · RN-02 (calcularSituacao) · casos de borda (0, 10, 5.0, 7.0, aluno sem matrícula, curso sem notas) |
| `src/lib/api/matriculas.test.ts` | RN-03 (duplicata capturada como `MatriculaDuplicadaError`) |
| `src/lib/api/alunos.test.ts` | RN-04 (filtro na query · `calcularMediaGeral` como segunda defesa) |

---

## 13. Ambiente e Segurança

```env
DATABASE_URL          # URL PostgreSQL
AUTH_SECRET           # Segredo JWT (openssl rand -base64 32)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY
NODE_ENV              # development | test | production
```

Todas validadas com Zod em `src/lib/env.ts` — a aplicação falha no startup se alguma estiver ausente.
