# FelixADM Web - TODO

## PWA (Progressive Web App)
- [x] Configurar manifest.json com icons e metadados
- [x] Criar service worker para offline support
- [x] Ícone 180x180px para iOS

## Banco de Dados
- [x] Criar schema com tabelas: Clients, Products, Sales, Installments
- [x] Executar pnpm db:push para sincronizar banco de dados

## Backend (tRPC Procedures)
- [x] Implementar procedures para Clientes (list, create, update, delete)
- [x] Implementar procedures para Produtos (list, create, update, delete)
- [x] Implementar procedures para Vendas (list, create, update, delete)
- [x] Implementar procedures para Parcelas (list, create, update, markAsPaid)
- [x] Implementar upload de fotos para produtos
- [x] Escrever testes vitest para procedures críticas (13 testes, todos passando)

## Frontend - Estrutura
- [x] Remover autenticação Manus Auth
- [x] Configurar tema com cores pink/purple
- [x] Criar Layout com navegação responsiva
- [x] Criar rotas: Dashboard, Clientes, Produtos, Vendas, Parcelas

## Frontend - Páginas
- [x] Dashboard com resumo de vendas e parcelas pendentes
- [x] Página de Clientes com CRUD completo
- [x] Página de Produtos com upload de fotos e edição
- [x] Página de Vendas com listagem e criação de vendas
- [x] Página de Parcelas com 100% funcionalidade (listar, marcar como pago, atualizar status)

## Testes
- [x] Testar fluxo sem autenticação (13 testes passando)
- [x] Testar CRUD de clientes (list, create, update, delete, validação)
- [x] Testar CRUD de produtos (list, create, update, delete)
- [x] Testar CRUD de vendas (list, create, update, delete)
- [x] Testar gestão de parcelas (testes preparados)

## Relatórios
- [x] Página de Relatórios com gráficos (Recharts)
- [x] Gráfico de vendas por dia (linha)
- [x] Gráfico de status de parcelas (pizza)
- [x] Gráfico de produtos mais vendidos (barras)
- [x] KPIs: Total vendas, parcelas pagas, vencidas, taxa de pagamento

## Notificações
- [x] Criar server/notifications.ts com 3 funções
- [x] Criar server/cron.ts com configuração de jobs
- [x] Adicionar procedures de notificações ao routers.ts
- [x] Verificar parcelas vencidas (a cada 6h)
- [x] Resumo diário de vendas (20:00)
- [x] Alerta de parcelas vencendo (09:00)

## Dados de Exemplo
- [x] Criar seed-db.mjs com dados de teste
- [x] 5 clientes de exemplo
- [x] 6 produtos de exemplo
- [x] 15 vendas com datas variádas
- [x] Parcelas em 1x e 3x com status misto

## Deploy
- [x] Gerar checkpoint final (v7081e204)
- [x] Preparar para Cloudflare Pages (PWA pronto)
- [x] Criar wrangler.toml para Cloudflare Workers
- [x] Criar _redirects para roteamento SPA
- [x] Criar _headers para segurança e PWA
- [x] Criar GitHub Actions workflow (CI/CD automático)
- [x] Criar DEPLOY.md com guia completo
- [x] Criar README_DEPLOY.md com instruções
