# Setup do Frontend

Este guia prepara o `UmbrellaMarketplace`, a aplicação Angular do marketplace de medicamentos.

## Requisitos

- Node.js compatível com Angular 19
- npm
- Backend disponível localmente ou publicado
- Chrome/Chromium para testes headless

## Instalação

```bash
npm install
```

## Configuração de API

Atualize os arquivos de ambiente em `src/environments/` conforme o backend usado:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api'
};
```

Em produção, mantenha `apiUrl` apontando para a API publicada.

## Rodando localmente

```bash
npm start
```

A aplicação abre em:

```text
http://localhost:4200
```

## Fluxos principais para validar

1. Cadastro/login em `/auth`.
2. Busca e filtros na home.
3. Detalhe do produto e upload de receita quando o produto exigir prescrição.
4. Carrinho em `/cart`.
5. Checkout interno em `/checkout`.
6. Redirecionamento para Stripe.
7. Confirmação em `/checkout/success` ou cancelamento em `/checkout/cancel`.
8. Histórico em `/orders`.
9. Perfil e receitas em `/profile`.
10. Assinaturas em `/subscriptions`.
11. Painel da farmácia em `/pharmacy` com usuário `pharmacist` ou `operator` vinculado a uma farmácia.
12. Cadastro de farmácia em `/pharmacy/register` (cliente autenticado).
13. Painel da farmácia com aba Financeiro em `/pharmacy`.
14. Admin global em `/admin` com role `admin` (aprovação de farmácias e GMV).
15. Plano SaaS e assinatura Stripe em `/pharmacy` → aba Plano SaaS.

## Testes

Build:

```bash
npm run build
```

Unit tests:

```bash
npm test -- --no-watch --browsers=ChromeHeadless
```

E2E com Playwright:

```bash
npx playwright install chromium
npm run e2e
```

CI (GitHub Actions) executa build, testes unitários e e2e no push/PR.

E2E integrado (`e2e/shopping-flow.spec.ts`) simula login, carrinho e checkout com API mockada — não depende do backend real.

E2E do painel farmácia (`e2e/pharmacy-dashboard.spec.ts`) valida métricas, conversão e aba financeira com API mockada.

E2E do painel admin (`e2e/admin-dashboard.spec.ts`) valida métricas da plataforma, financeiro, exportação CSV e aprovação de farmácias com API mockada.

E2E de perfil (`e2e/profile.spec.ts`) valida edição de dados, listagem de receitas e ativação de push notifications com APIs mockadas.

E2E de assinaturas (`e2e/subscriptions.spec.ts`) valida listagem e cancelamento de planos recorrentes.

E2E de checkout com cupom (`e2e/checkout-coupon.spec.ts`) valida aplicação de cupom e envio no pagamento.

E2E de onboarding (`e2e/pharmacy-onboarding.spec.ts`) valida seleção de plano SaaS e envio do cadastro de farmácia.

E2E de receita (`e2e/prescription-upload.spec.ts`) valida upload de prescrição em produto controlado.

Testes contra API real (opcional):

```bash
E2E_API_URL=http://localhost:4000/api npx playwright test e2e/integration-api.spec.ts
```

Painel da farmácia permite cadastrar, editar e remover produtos (respeitando limite do plano) e exportar CSV financeiro.

Deploy em produção: consulte [DEPLOY.md](./DEPLOY.md). Configs prontas: `vercel.json` e `netlify.toml`.

Notificações push: ative em **Meu perfil** (requer VAPID configurado no backend e HTTPS).

## Observações

- A paleta visual mantém a identidade atual com `#F74838` como cor principal.
- O checkout multi-farmácia pode retornar mais de uma sessão Stripe; a tela `/checkout` mostra um link de pagamento por farmácia.
- O botão de assinatura aparece somente para produtos com `allows_subscription = true`.
- Medicamentos com `requires_prescription = true` precisam de receita aprovada antes do checkout.

