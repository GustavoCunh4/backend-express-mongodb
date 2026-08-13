# Backend Express + MongoDB

API de tarefas com autenticação por JWT, feita em Node.js/TypeScript com Express 5 e MongoDB (Mongoose). Cada usuário cadastra tarefas com título, status, prioridade e data de vencimento, e só enxerga as próprias — o resto é login, registro e um CRUD protegido por token.

Esse repo é a metade Mongo de um exercício que fiz em dois bancos diferentes de propósito: a mesma API, o mesmo domínio (tarefas + auth), rodando uma vez sobre MongoDB e outra sobre PostgreSQL (repo `backend-express-postgresql`). A ideia era sentir na mão a diferença entre modelar como documento e modelar como tabela relacional, não só ler sobre isso. Deu pra perceber bem rápido: aqui o schema é solto (o Mongoose valida no nível da aplicação, o banco não impõe muita coisa), a query de filtro por título vira regex, e não existe transação real cobrindo as duas coleções — se eu fosse fazer de novo com relações mais fortes entre entidades, provavelmente escolheria Postgres direto e usaria o Mongo só se o motivo fosse dado sem estrutura fixa de verdade.

## Como está organizado

`src/routes` define o que é público e o que passa por `authMiddleware`; `controllers` só traduzem HTTP pra chamada de serviço; `services` tem a regra de negócio (hash de senha, emissão de JWT, CRUD de tarefas com checagem de dono); `models` são os schemas do Mongoose; `database/connection.ts` cuida da conexão (com timeout curto pra não travar em ambiente serverless). Tem um endpoint `/_debug/db` que mostra o estado da conexão com a URI mascarada — só fica ativo fora de produção, de propósito.

## Rodando local

```bash
npm install
npm run dev
```

Precisa de um MongoDB acessível — local (`mongodb://127.0.0.1:27017/...`) ou um cluster Atlas. Copie `.env.example` para `.env` e preencha:

- `PORT` — porta do servidor (padrão 3000)
- `NODE_ENV` — `development` usa `MONGO_URI`, `production` usa `MONGO_URI_PROD`
- `MONGO_URI` / `MONGO_URI_PROD` — string de conexão do Mongo
- `JWT_SECRET` — chave de assinatura do token (obrigatório, sem valor padrão)
- `JWT_EXPIRES` — validade do token (padrão `1h`)

Sem `MONGO_URI` a aplicação nem sobe; sem `JWT_SECRET` o login falha com erro explícito em vez de assinar token com segredo vazio.

## Deploy

Vercel, via `api/index.ts` (handler serverless que reaproveita a mesma conexão entre invocações) e `vercel.json` reescrevendo tudo pra esse handler. As variáveis de ambiente de produção são as mesmas do `.env`, configuradas no painel da Vercel.

## Testando

`requests/` tem uma coleção pro Insomnia (`requests.yaml` para produção, `requests_local.yaml` com URLs fixas em `127.0.0.1`) cobrindo os casos de sucesso e erro de cada rota — não é suíte automatizada, é o roteiro que usei pra validar manualmente durante o desenvolvimento.

## O que eu mudaria hoje

Não tem teste automatizado — o que existe é a coleção do Insomnia. Numa versão de produção de verdade eu adicionaria Vitest cobrindo os services (é onde está a lógica) antes de qualquer coisa. Também tornaria `JWT_EXPIRES` mais curto por padrão com refresh token, porque 1h de acesso sem revogação não é o ideal pra nada que não seja estudo.
