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

## Observações

- A paleta visual mantém a identidade atual com `#F74838` como cor principal.
- O checkout multi-farmácia pode retornar mais de uma sessão Stripe; a tela `/checkout` mostra um link de pagamento por farmácia.
- O botão de assinatura aparece somente para produtos com `allows_subscription = true`.
- Medicamentos com `requires_prescription = true` precisam de receita aprovada antes do checkout.

