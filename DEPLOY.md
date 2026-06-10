# Deploy do Frontend

Guia para publicar o Angular em produção (Vercel, Netlify, Render Static ou similar).

## Build de produção

```bash
npm ci
npm run build
```

Saída em `dist/umbrella-marketplace-web/browser` (Angular 19).

## Configurar API

Antes do build, ajuste `src/environments/environment.ts`:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://sua-api.onrender.com/api'
};
```

Para CI/CD, use substituição de arquivo ou variável de build do provedor apontando para a API publicada.

Variáveis como `CRON_SECRET`, `OPENAI_API_KEY`, `STRIPE_*` e integrações Uber/99 são configuradas **apenas no backend** (Render Web Service). Consulte `DEPLOY.md` no repositório `UmbrellaMarket-Backend`.

## Vercel

1. Importe o repositório `UmbrellaMarketplace`.
2. Framework preset: **Angular**.
3. Build command: `npm run build`
4. Output directory: `dist/umbrella-marketplace-web/browser`
5. O arquivo `vercel.json` na raiz já inclui rewrite SPA.

## Netlify

O arquivo `netlify.toml` na raiz já define build, publish e redirect SPA.

## Push notifications

Requer HTTPS em produção. Configure VAPID no backend e ative em **Meu perfil** no frontend. O service worker está em `public/sw.js`.

## Variáveis no backend após deploy do frontend

Atualize no backend:

```env
SUCCESS_URL=https://seu-dominio.com/checkout/success
CANCEL_URL=https://seu-dominio.com/checkout/cancel
PHARMACY_PANEL_URL=https://seu-dominio.com/pharmacy
```

## Validação pós-deploy

1. Home carrega produtos.
2. Login e carrinho funcionam contra a API de produção.
3. Checkout redireciona para Stripe e retorna em `/checkout/success`.
4. Painel farmácia e admin acessíveis com usuários corretos.

## E2E contra staging

```bash
E2E_API_URL=https://sua-api.onrender.com/api npm run e2e
```
