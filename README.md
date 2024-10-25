# Bank Transaction API

## Tecnologias utilizadas
- Nest.js
- Node.js
- Express.js
- Typescript
- Docker
- Jest
- Github Actions (pipeline de testes)
- Swagger
- Grafana + Loki

## Exemplos de concorrência
Os exemplos de concorrência utilizados para teste foram os disponíveis na tabela verdade em: [https://gist.github.com/gp-breno/71e3f5e0b85b97c79911037d8643e81e](https://gist.github.com/gp-breno/71e3f5e0b85b97c79911037d8643e81e)

## Instruções para rodar o projeto
1. Clone o projeto com o comando:
   ```bash
   git clone git@github.com:kaiohenrikk/bank-transaction-api.git

2. Instale o Docker. No site oficial tem explicando: https://docs.docker.com.

3. Após isso, é só rodar o comando:
   ```bash
   docker compose up -d

   Após o processo finalizar, será possível:

   - Acessar a API em: http://localhost:3000/bank-transaction-api
   - Acessar a documentação no Swagger em: http://localhost:3000/api-docs
   - Acessar o Grafana para ver os logs em: http://localhost:3001/login

## Como visualizar os logs no Grafana

1. Acesse a URL;

2. Use as credenciais para logar:
   - User: admin;
   - Password: Admin;

3. Clique em Login e depois Skip;

4. Clique em Explore (no lado esquerdo);

5. Depois, clique em "Grafana", que está do lado de "Outline";

6. Agora, clique em Open advanced data source picker;

7. Clique em Configure a new data source;

8. Selecione Loki;

9. No campo URL, coloque: http://loki:3100;

10. Agora, clique em Save & test e clique em Explore view.

11. Selecionar os filtros. Para ver todos:
    - Label = app_name = bank-transaction-api
    - E clique em Run query.

## Testes de concorrência

Os testes de concorrência se encontram em: https://github.com/kaiohenrikk/bank-transaction-api/blob/main/tests/integration/transactions/controller/transactions.controller.test.ts na linha 122.