import { Page } from '@playwright/test';

/** Habilita o botão de pagamento quando o checkout exige frete cotado. */
export async function selectPickupOnCheckout(page: Page) {
  await page.getByRole('button', { name: 'Retirada na farmácia' }).click();
}

export function checkoutPayButton(page: Page, multiPharmacy = false) {
  return page.getByRole('button', {
    name: multiPharmacy ? 'Pagar tudo em uma transação' : 'Pagar com segurança'
  });
}
