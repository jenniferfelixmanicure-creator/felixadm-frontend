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
- [ ] Escrever testes vitest para procedures críticas

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

## Deploy
- [x] Gerar checkpoint final (v7081e204)
- [x] Preparar para Cloudflare Pages (PWA pronto)
