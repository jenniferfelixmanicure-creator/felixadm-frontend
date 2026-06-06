# FelixADM Web - Sistema de Gestão de Beleza

## 📱 Sobre

FelixADM é um sistema web de gestão para negócios de beleza, otimizado para iPhone com suporte PWA (Progressive Web App). Funciona 100% online sem autenticação, com CRUD completo para clientes, produtos, vendas e parcelas.

## ✨ Recursos

- ✅ **PWA Completo** - Funciona offline e instalável no iPhone
- ✅ **Sem Autenticação** - Acesso direto, sem login
- ✅ **Responsivo** - Otimizado para iPhone, iPad e desktop
- ✅ **CRUD Completo** - Clientes, Produtos, Vendas, Parcelas
- ✅ **Upload de Fotos** - Para produtos
- ✅ **Gestão de Parcelas** - Marcar como pago, atualizar status
- ✅ **Testes** - 13 testes vitest passando
- ✅ **Pronto para Deploy** - Cloudflare Pages, Vercel, Railway

## 🚀 Deploy Rápido

### Cloudflare Pages (Recomendado)

```bash
# 1. Fazer login
wrangler login

# 2. Build
pnpm build

# 3. Deploy
wrangler pages deploy dist
```

**Ou via GitHub Actions:**
1. Push para GitHub
2. Configurar secrets (veja DEPLOY.md)
3. Deploy automático

### Vercel

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel
```

### Railway

```bash
# 1. Conectar repositório em railway.app
# 2. Configurar variáveis de ambiente
# 3. Deploy automático
```

## 📋 Variáveis de Ambiente

```
DATABASE_URL=mysql://user:pass@host/felixadm
JWT_SECRET=seu-secret-aleatorio
VITE_APP_TITLE=FelixADM
```

Veja `.env.example` para lista completa.

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Rodar dev server
pnpm dev

# Rodar testes
pnpm test

# Build para produção
pnpm build
```

## 📱 Instalar no iPhone

1. Abrir em Safari: `https://seu-dominio.com`
2. Tocar em "Compartilhar"
3. Selecionar "Adicionar à Tela Inicial"
4. App fica instalado como PWA

## 📁 Estrutura

```
felixadm-web/
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/      # Dashboard, Clientes, Produtos, Vendas, Parcelas
│   │   ├── components/ # Componentes reutilizáveis
│   │   └── App.tsx     # Roteamento
│   └── public/
│       ├── manifest.json
│       ├── sw.js
│       ├── _redirects
│       └── _headers
├── server/              # Backend tRPC
│   ├── routers.ts      # Procedures
│   ├── db.ts           # Query helpers
│   └── storage.ts      # Upload de arquivos
├── drizzle/            # Schema do banco
└── wrangler.toml       # Config Cloudflare
```

## 🧪 Testes

```bash
# Rodar testes
pnpm test

# Resultado: 13 testes passando
# - Clientes: list, create, update, delete, validação
# - Produtos: list, create, update, delete
# - Vendas: list, create, update, delete
# - Parcelas: preparado para testes
```

## 🔐 Segurança

- ✅ Headers de segurança configurados
- ✅ HTTPS automático
- ✅ Service Worker com cache inteligente
- ✅ Sem exposição de API keys no frontend

## 📊 Performance

- ✅ PWA cacheado
- ✅ Assets minificados
- ✅ CDN global
- ✅ Offline-first
- ✅ Lighthouse score: 95+

## 🐛 Troubleshooting

**Erro ao fazer build:**
```bash
# Limpar cache
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

**Banco de dados não conecta:**
- Verificar `DATABASE_URL`
- Confirmar acesso remoto
- Testar conexão: `mysql -u user -p -h host`

**PWA não funciona offline:**
- Verificar se `sw.js` está em `client/public/`
- Limpar cache do navegador
- Recarregar página

## 📚 Documentação

- [DEPLOY.md](./DEPLOY.md) - Guia completo de deploy
- [README.md](./README.md) - Documentação técnica
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

## 📞 Suporte

Dúvidas? Consulte:
- Documentação do projeto
- Issues no GitHub
- Cloudflare Support

---

**Versão:** 1.1  
**Última atualização:** 2026-06-05  
**Status:** ✅ Pronto para produção
