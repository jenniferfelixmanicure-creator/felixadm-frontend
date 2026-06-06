# 🚀 Guia de Deploy - FelixADM Web

## Deploy no Cloudflare Pages

### Pré-requisitos
- Conta Cloudflare (gratuita)
- Repositório GitHub
- Variáveis de ambiente configuradas

### Opção 1: Deploy Manual via CLI

```bash
# 1. Instalar Wrangler CLI
npm install -g wrangler

# 2. Fazer login
wrangler login

# 3. Build do projeto
pnpm build

# 4. Deploy
wrangler pages deploy dist
```

### Opção 2: Deploy Automático via GitHub Actions

1. **Push do código para GitHub**
   ```bash
   git push origin main
   ```

2. **Configurar secrets no GitHub**
   - Ir em: `Settings → Secrets and variables → Actions`
   - Adicionar:
     - `CLOUDFLARE_API_TOKEN` - Token da API Cloudflare
     - `CLOUDFLARE_ACCOUNT_ID` - ID da conta Cloudflare
     - `DATABASE_URL` - URL do banco de dados
     - `JWT_SECRET` - Secret para JWT

3. **O GitHub Actions fará deploy automaticamente**

### Obter Cloudflare API Token

1. Ir em https://dash.cloudflare.com/profile/api-tokens
2. Criar novo token com permissões:
   - `Account.Cloudflare Pages` - Edit
   - `Account.Workers KV Storage` - Edit (opcional)

### Obter Account ID

1. Ir em https://dash.cloudflare.com
2. Clicar em qualquer domínio
3. URL terá: `https://dash.cloudflare.com/{ACCOUNT_ID}`

### Estrutura de Deploy

```
dist/
├── index.html          # SPA entry point
├── assets/             # JS/CSS bundle
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
├── _redirects         # Roteamento SPA
└── _headers           # Headers de segurança
```

### Variáveis de Ambiente Necessárias

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/felixadm

# Authentication
JWT_SECRET=seu-secret-aleatorio-aqui

# OAuth (se usar Manus Auth no futuro)
VITE_APP_ID=seu-app-id
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Storage
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=seu-api-key
```

### Verificar Deploy

1. Ir em https://dash.cloudflare.com
2. Selecionar projeto `felixadm-web`
3. Ver histórico de deploys
4. URL será: `https://felixadm-web.pages.dev`

### Domínio Customizado

1. No Cloudflare Pages → Configurações
2. Adicionar domínio customizado
3. Apontar DNS para Cloudflare

### PWA no iPhone

1. Abrir em Safari: `https://seu-dominio.com`
2. Tocar em "Compartilhar"
3. Selecionar "Adicionar à Tela Inicial"
4. App ficará instalado como PWA

### Troubleshooting

**Erro: "Cannot find package 'dotenv'"**
- Remover `import 'dotenv/config'` do `server/_core/index.ts`
- Cloudflare injeta variáveis automaticamente

**Erro: "Database connection failed"**
- Verificar `DATABASE_URL` nos secrets
- Confirmar que banco está acessível de fora

**Erro: "Service Worker não registra"**
- Verificar se `sw.js` está em `client/public/`
- Confirmar que `_headers` está configurado corretamente

### Performance

- ✅ PWA funciona offline
- ✅ Service Worker cacheado
- ✅ Assets minificados
- ✅ CDN global Cloudflare
- ✅ Suporte a HTTPS automático

### Próximos Passos

1. Configurar domínio customizado
2. Adicionar analytics (Cloudflare Analytics)
3. Configurar email de notificações
4. Monitorar performance

---

**Dúvidas?** Consulte a documentação oficial:
- https://developers.cloudflare.com/pages/
- https://developers.cloudflare.com/workers/
