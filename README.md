# 🍕 Pizza Shop API

Este projeto é uma API desenvolvida com ElysiaJS e utilizando o runtime Bun para oferecer alta performance e eficiência. A API permite gerenciar pedidos e restaurantes.


## 🚀 Funcionalidades

- 📜 Cadastro de restaurantes, gerente e clientes
- 🛒 Gestão de pedidos (atualização de status e cancelamento)
- 📈 Métricas de receita diária e mensal
- 👤 Autenticação de usuários


## 🛠️ Tecnologias Utilizadas

- Framework: ElysiaJS
- Runtime: Bun
- Banco de Dados: PostgreSQL
- Autenticação: Cookie(JWT)
- ORM: Drizzle ORM
## 🔑 Variáveis de Ambiente

Para rodar esse projeto, você vai precisar adicionar as seguintes variáveis de ambiente no seu .env

`DATABASE_URL`

`API_BASE_URL`

`AUTH_REDIRECT_URL`

`JWT_SECRET_KEY`


## 📦 Instalação

1. Clone o repositório:

```bash
  git clone https://github.com/seu-usuario/pizza-shop.git
```

2. Navegue até a pasta do projeto:

```bash
  cd pizza-shop
```

3. Instale as dependências:

```bash
  bun i
```
ou
```bash
  bun install
```

4. Suba o o container docker:

```bash
  docker compose up -d
```

5. Configure as variáveis de ambiente

6. Rode as `migrations`:

```bash
  bun migrate
```
ou
```bash
  bun run migrate
```

7. Execute a API:

```bash
  bun dev
```
ou
```bash
  bun run dev
```

8. Opcional(acesso a documentação):

```bash
  http://localhost:333/swagger
```