/* Set values + misc */
let promoCode, promoPrice;
const fadeTime = 300;

// Voltar para página anterior
document.addEventListener("DOMContentLoaded", function() {
  const goBackBtn = document.getElementById("goBack-btn");
  if (goBackBtn) {
    goBackBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  // Assign actions
  document.querySelectorAll(".quantity input").forEach(input => {
    input.addEventListener("change", function() {
      updateQuantity(this);
      checkCartEmpty(); // Verifica se o carrinho está vazio
    });
  });

  document.querySelectorAll(".remove button").forEach(button => {
    button.addEventListener("click", function() {
      removeItem(this);
    });
  });

  updateSumItems();
  checkCartEmpty(); // Verifica se o carrinho está vazio ao carregar a página

  document.querySelector(".promo-code-cta")?.addEventListener("click", () => {
    promoCode = document.getElementById("promo-code").value.trim();

    if (promoCode === "10off" || promoCode === "10OFF") {
      promoPrice = 10;
    } else if (promoCode) {
      alert("Código Promocional Inválido");
      promoPrice = 0;
    }

    if (promoPrice) {
      document.querySelector(".summary-promo").classList.remove("hide");
      document.querySelector(".promo-value").textContent = promoPrice.toFixed(2);
      recalculateCart(true);
    }
  });
});

/* Recalculate cart */
function recalculateCart(onlyTotal = false) {
  let subtotal = 0;

  document.querySelectorAll(".basket-product").forEach(product => {
    subtotal += parseFloat(product.querySelector(".subtotal")?.textContent || 0);
  });

  let total = subtotal;
  const promoValueElement = document.querySelector(".promo-value");
  promoPrice = parseFloat(promoValueElement?.textContent) || 0;

  if (promoPrice && subtotal >= 10) {
    total -= promoPrice;
  } else if (promoPrice && subtotal < 10) {
    alert("O valor do pedido precisa ser maior que R$10 para aplicar o código.");
    document.querySelector(".summary-promo").classList.add("hide");
  }

  if (onlyTotal) {
    document.querySelector(".total-value").classList.add("fade-out");
    setTimeout(() => {
      document.getElementById("basket-total").textContent = total.toFixed(2);
      document.querySelector(".total-value").classList.remove("fade-out");
    }, fadeTime);
  } else {
    document.querySelector(".final-value").classList.add("fade-out");
    setTimeout(() => {
      document.getElementById("basket-subtotal").textContent = subtotal.toFixed(2);
      document.getElementById("basket-total").textContent = total.toFixed(2);
      if (total === 0) {
        document.querySelector(".checkout-cta").style.display = "none";
      } else {
        document.querySelector(".checkout-cta").style.display = "block";
      }
      document.querySelector(".final-value").classList.remove("fade-out");
    }, fadeTime);
  }

  checkCartEmpty(); // Atualiza o estado do carrinho vazio após recalcular
}

/* Update quantity */
function updateQuantity(quantityInput) {
  const productRow = quantityInput.closest(".basket-product");
  const price = parseFloat(productRow.querySelector(".price").textContent || 0);
  const quantity = parseInt(quantityInput.value) || 0;
  const linePrice = price * quantity;

  productRow.querySelector(".subtotal").classList.add("fade-out");
  setTimeout(() => {
    productRow.querySelector(".subtotal").textContent = linePrice.toFixed(2);
    recalculateCart();
    productRow.querySelector(".subtotal").classList.remove("fade-out");
  }, fadeTime);

  productRow.querySelector(".item-quantity").textContent = quantity;
  updateSumItems();
}

/* Update total items */
function updateSumItems() {
  let sumItems = 0;
  document.querySelectorAll(".quantity input").forEach(input => {
    sumItems += parseInt(input.value) || 0;
  });
  document.querySelector(".total-items").textContent = sumItems;
}

/* Remove item from cart */
function removeItem(removeButton) {
  const productRow = removeButton.closest(".basket-product");
  productRow.classList.add("fade-out");
  setTimeout(() => {
    productRow.remove();
    recalculateCart();
    updateSumItems();
  }, fadeTime);
}

/* Check if the cart is empty */
function checkCartEmpty() {
  const basket = document.querySelector(".basket");
  const summary = document.querySelector(".summary");
  const emptyCartMessage = document.getElementById("empty-cart-message");
  const products = document.querySelectorAll(".basket-product");

  if (products.length === 0) {
    basket.style.display = "none";
    summary.style.display = "none";
    emptyCartMessage.style.display = "block";
  } else {
    basket.style.display = "block";
    summary.style.display = "block";
    emptyCartMessage.style.display = "none";
  }
}
