# Boas Práticas — Escola Online

Guia de convenções e decisões de implementação específicas deste projeto. Complementa o manual global em `~/.claude/CLAUDE.md`.

---

## Regras de Negócio

As funções de cálculo vivem em `src/lib/utils/notas.ts` e são **funções puras** — sem dependência de banco ou contexto de requisição. Isso permite testá-las diretamente com Vitest sem nenhum mock.

```typescript
// Assinaturas corretas — não alterar sem atualizar os testes
calcularMedia(valores: number[]): number | null
calcularMediaGeral(matriculas: { notas: { valor: number }[] }[]): number | null
calcularSituacao(media: number | null): Situacao
```

Os call sites devem mapear antes de chamar:
```typescript
// Correto
const media = calcularMedia(matricula.notas.map(n => n.valor))
const situacao = calcularSituacao(media)

// Errado — não passar objetos {valor} direto
const media = calcularMedia(matricula.notas)
```

---

## Server Actions — Padrão de Retorno

Todas as actions retornam `{ success: true }` ou `{ error: { ... } }`. **Nunca usam `redirect()` internamente.** A navegação pós-sucesso é responsabilidade do formulário cliente via `router.push()`.

```typescript
// Padrão de retorno
type ActionResult = {
  error?: Record<string, string[]>
  success?: true
}

// Formulários usam useTransition + router.push
startTransition(async () => {
  const result = await criarAluno(data)
  if (result.success) { router.push('/alunos'); return }
  if (result.error) setErrors(result.error)
})
```

Isso permite que testes de integração chamem as actions diretamente e inspecionem o retorno sem interceptar navegação.

---

## requireAuth — Lança Erro, Não Redireciona

```typescript
// auth-guard.ts
if (!session?.user) throw new Error('Não autenticado')
```

Razão: `redirect()` lança uma exceção especial do Next.js que interrompe testes. Com `throw new Error`, os testes unitários de segurança podem verificar `rejects.toThrow(/não autenticado/i)` normalmente.

---

## Testes — Padrão de Mock do Prisma

```typescript
vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: { findMany: vi.fn() },
  },
}))

const mockFindMany = vi.mocked(prisma.aluno.findMany)

// Usar "as never" para dados parciais (TypeScript não reclama)
mockFindMany.mockResolvedValue(dadosParciais as never)
```

Nunca mockar `@/lib/utils/notas` — essas funções devem ser testadas com a implementação real.

---

## Prisma — Queries por Finalidade

Manter funções separadas no `lib/api/` para cada finalidade. Não reutilizar uma query de listagem para formulários de edição:

| Função | `select` | Uso |
|---|---|---|
| `buscarAlunoPorId` | tudo + matrículas + notas | Página de detalhes |
| `buscarAlunoParaEdicao` | apenas campos do form | Página de edição |
| `buscarAlunoParaBoletim` | tudo + cursos + notas ordenadas | Boletim |
| `listarAlunosParaRanking` | id · nome · fotoUrl + notas (valor only) | Ranking |

---

## Cloudinary — Rollback Obrigatório

Ao implementar upload de foto, seguir este padrão rigorosamente:

```typescript
// 1. Fazer upload
const { url, publicId } = await uploadImagem(fotoBase64)

try {
  // 2. Persistir no banco
  await prisma.aluno.create({ data: { ...dados, fotoUrl: url, fotoPublicId: publicId } })
} catch (err) {
  // 3. Se banco falhar, deletar a imagem para evitar órfão
  await deletarImagemCloudinary(publicId)
  throw err
}
```

---

## Nomes de Arquivos e Exportações

| Onde | Convenção |
|---|---|
| `src/actions/*.ts` | Exportar funções sem sufixo "Action" para que testes possam importar com nomes limpos. Ex: `criarAluno`, `lancarNota` |
| `src/lib/api/*.ts` | Funções nomeadas com verbo+substantivo. Ex: `buscarAlunoParaBoletim` |
| Schemas Zod | `xyzSchema` + `XyzFormData = z.infer<typeof xyzSchema>` |

---

## Pendências Conhecidas

Os seguintes itens estão **planejados mas não implementados**. Não criar workarounds:

1. `src/lib/cloudinary.ts` — `uploadImagem()` e `deletarImagemCloudinary()`
2. `onDelete: Cascade` no schema do Prisma (Matricula→Aluno, Matricula→Curso, Nota→Matricula)
3. `GET /api/ranking` — retorna 501, aguardando implementação com `listarAlunosParaRanking`
4. `GET /api/boletim/[id]` — retorna 501, aguardando implementação com `@react-pdf/renderer`
5. Envio de e-mail via Resend ao lançar nota
