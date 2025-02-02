let promoCode, promoPrice;
const fadeTime = 300;

document.addEventListener("DOMContentLoaded", function() {
    // Voltar para página anterior
    const goBackBtn = document.getElementById("goBack-btn");
    if (goBackBtn) {
        goBackBtn.addEventListener("click", () => {
            window.location.href = "/index.html";
        });
    }

    // Ações de promoção
    document.querySelector(".promo-code-cta")?.addEventListener("click", () => {
        promoCode = document.getElementById("promo-code").value.trim();
        promoPrice = promoCode === "10off" || promoCode === "10OFF" ? 10 : 0;

        if (promoPrice) {
            document.querySelector(".summary-promo").classList.remove("hide");
            document.querySelector(".promo-value").textContent = promoPrice.toFixed(2);
            recalculateCart(true);
        } else if (promoCode) {
            alert("Código Promocional Inválido");
        }
    });

    // Carregar produtos
    loadProducts();
});

/* Load Products from API */
async function loadProducts() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/html/auth.html";
        return;
    }

        const response = await fetch('http://localhost:999/api/cart/list', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token}`
            }
        });
        const produtos = await response.json();
        displayProducts(produtos);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

/* Display Products in Cart */
function displayProducts(produtos) {
    const cartContainer = document.getElementById("basket-products-container");
    cartContainer.innerHTML = ""; // Limpa o contêiner antes de exibir novos produtos

    produtos.forEach(produto => {
        const productCard = createProductCard(produto);
        cartContainer.appendChild(productCard);
    });

    updateSumItems();
    checkCartEmpty();
    recalculateCart();
}

/* Create Product Card */
function createProductCard(produto) {
    const productRow = document.createElement('div');
    productRow.classList.add("basket-product");
    
    productRow.innerHTML = `
        <div class="item">
            <div class="product-image">
                <img src="${produto.imagem}" alt="${produto.nome}" class="product-frame">
            </div>
            <div class="product-details">
                <h1><strong><span class="item-quantity">${produto.quantidade}</span> x ${produto.nome}</strong></h1>
                <p>Identificador - ${produto.id}</p>
            </div>
        </div>
        <div class="price">${produto.preco.toFixed(2)}</div>
        <div class="quantity">
            <input type="number" value="${produto.quantidade}" min="1" class="quantity-field" onchange="updateQuantity(this)">
        </div>
        <div class="subtotal">${(produto.preco * produto.quantidade).toFixed(2)}</div>
        <div class="remove">
            <button class="btn-remove" onclick="removeItem('${produto.id}', this)"><i class="fa-regular fa-trash-can"></i></button>
        </div>
    `;

    return productRow;
}

/* Update Quantity */
async function updateQuantity(quantityInput) {
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

/* Remove item from cart */
async function removeItem(id, removeButton) {
    const productRow = removeButton.closest(".basket-product");

    try {
        const res = await fetch(`http://localhost:999/api/cart/${id}`, {
            method: "DELETE"
        });
        
        if (!res.ok) {
            throw new Error(`Falha ao remover o produto: ${res.status}`);
        };
    
        productRow.classList.add("fade-out");
        setTimeout(() => {
            productRow.remove();
            recalculateCart();
            updateSumItems();
        }, fadeTime);
    } catch (error) {
        console.error(error);
        alert("Falha ao remover o produto.");
    };
};

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

/* Update total items */
function updateSumItems() {
    let sumItems = 0;
    
    document.querySelectorAll(".quantity input").forEach(input => {
        sumItems += parseInt(input.value) || 0;
    });
    document.querySelector(".total-items").textContent = sumItems;
}

/* Update quantity */
async function updateQuantity(quantityInput) {
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

async function uploadQuantity() {
    // Seleciona todos os produtos no carrinho
    const quantityInputs = document.querySelectorAll(".basket-product");

    // Mapeia os dados de cada produto (id e quantidade) em um array
    const quantities = Array.from(quantityInputs).map(productRow => {
        const id = productRow.querySelector(".btn-remove").getAttribute("onclick").match(/'([^']+)'/)[1]; // Extrai o ID do produto
        const quantity = parseInt(productRow.querySelector(".quantity-field").value) || 0; // Obtém a quantidade atualizada
        return { 
            id: Number(id), 
            quantidade: quantity 
        };
    });

    // Envia o array de produtos e suas quantidades para o backend
    try {
        const response = await fetch("http://localhost:999/api/cart", {
            method: "PUT", // Altera para PUT
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(quantities), // Envia diretamente o array de objetos com ID e quantidade de cada produto
        });

        if (!response.ok) {
            throw new Error("Erro ao atualizar quantidades");
        }
        
        const data = await response.json();
        console.log("Quantidade atualizada com sucesso:", data);
    } catch (error) {
        console.error("Erro ao atualizar quantidade:", error);
    }
}


// Adiciona o evento `beforeunload` para salvar quantidades ao sair da página
window.addEventListener("beforeunload", (event) => {
    uploadQuantity(); // Salva a quantidade dos produtos no back-end ao fechar a página
});


const checkoutButton = document.getElementById("goto-checkout");
checkoutButton.addEventListener("click", async () => {
    await uploadQuantity(); // Aguarda o upload de quantidades antes do checkout
    await checkout();
});

async function checkout() {
    try {
        const response = await fetch("http://localhost:999/api/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })   
        const data = await response.json();
        if (data.url) {
            window.location.href = data.url; // Redirect to checkout
        } else {
            console.error("Failed to load checkout", data.error);
        }
    } catch (error) {
        console.error("Failed to checkout", error);
    }
};

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

// Carregar produtos ao iniciar a página
loadProducts();
