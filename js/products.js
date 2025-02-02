const addCartBtn = document.getElementById("add-to-cart");
const buyNowBtn = document.getElementById("buy-now");

addCartBtn.addEventListener("click", addCart);
buyNowBtn.addEventListener("click", buyNow);

function addCart() {
  const id = Number(getQueryParam("id"));
  const product = produtos.find(p => p.id === id); // Use 'produtos' aqui
  const productAmount = Number(quantityField.value);

  // Auth
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/html/auth.html";
    return;
  }
  
  if (product.estoque == 0) {
    alert("O produto está esgotado");
    return;
  }

  if (product) {
    const cartItem = {
      imagem: product.imagem,
      nome: product.nome,
      quantidade: productAmount,
      id: product.id,
      preco: product.preco,
    };

    fetch("http://localhost:999/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify(cartItem)
    })
    .then(response => response.json())
    .then(data => {
      alert(product.nome + " adicionado ao carrinho");
    })
    .catch(error => console.log("Erro ao adicionar item ao carrinho: ", error));
  } else {
    console.log("Produto não encontrado");
  }
}

async function buyNow() {
  const id = Number(getQueryParam("id"));
  const product = produtos.find(p => p.id === id);
  const productAmount = Number(quantityField.value);

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/html/auth.html";
    return;
  }
  
  if (product.estoque == 0) {
    alert("O produto está esgotado");
    return;
  }

  if (product) {
    const cartItem = {
      imagem: product.imagem,
      nome: product.nome,
      quantidade: productAmount,
      id: product.id,
      preco: product.preco,
    };

    try {
      const response = await fetch("http://localhost:999/api/checkout/single-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(cartItem)
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redireciona para a página de checkout do item único
      } else {
        console.error("Erro ao iniciar o checkout:", data.error);
      }
    } catch (error) {
      console.error("Erro ao adicionar item ao carrinho:", error);
    }
  } else {
    console.log("Produto não encontrado");
  }
}

async function fetchProduct() {
  try {
    const query = getQueryParam("id");
    const response = await fetch(`http://localhost:999/api/product/${query}`);
    const data = await response.json();
    
    loadProductDetails(data);
  } catch (error) {
    throw new Error("Failed to fetch product")
  };
};

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function loadProductDetails(data) {
  if (data) {
    const product = data;

    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-description").textContent = product.description;
    document.getElementById("stock").textContent =`(${product.stock} Disponíveis)`;

    // Primary image
    const mainImage = document.getElementById("mainImg");
    const imagesContainer = document.getElementById("product-images");
    mainImage.src = product.Images[0].thumb_img;

    // Add miniatures
    product.Images.forEach(image => {
      Object.keys(image).forEach (imgKey => {
        const imgElement = document.createElement("img");
        imgElement.src = image[imgKey];
        imgElement.classList.add("thumbnail");
        
        // Ao clicar na miniatura, troca a imagem principal
        imgElement.onclick = () => {
          mainImage.src = image[imgKey];
        };

        imagesContainer.appendChild(imgElement);
      });
    });

    // Lógica de desconto e parcelas
    const originalPrice = product.price;
    let finalPrice = originalPrice;
    const discount = product.discount;

    if (discount > 0 || discount) {
      finalPrice = originalPrice * (1 - discount / 100);

      // Show the price with discount
        document.getElementById("product-price").textContent = `R$ ${finalPrice.toFixed(2).replace(".", ",")}`;
        document.querySelector(".isProduct-discount").textContent = `De R$ ${originalPrice.toFixed(2).replace(".", ",")}`;
        document.querySelector(".isProduct-discount").style.textDecoration = "line-through";
        
        // Show percentage OFF
        document.getElementById("product-discount").textContent = `${discount}% OFF`;
      } else {
        // Without discount
        document.getElementById("product-price-without-discount").textContent = `R$ ${originalPrice.toFixed(2).replace(".", ",")}`;
        document.getElementById("product-discount").textContent = ""; // Oculta o texto de desconto
        document.querySelector(".label-without-discount").style.display = "none";
      }

    // Cálculo de Parcelas
    const numParcelas = Math.min(10, Math.floor(finalPrice / 5));
    const valorParcela = finalPrice / numParcelas;

    if (numParcelas > 1) {
      document.querySelector("#product-installments").textContent = `Ou em até ${numParcelas}x de R$ ${valorParcela.toFixed(2).replace(".", ",")} sem juros`;
    } else {
      document.querySelector("#product-installments").textContent = "";
    }
  } else {
    console.error("Produto não encontrado");
  }
}

// Máscara para o CEP
const handleZipCode = (event) => {
  let input = event.target;
  input.value = zipCodeMask(input.value);
};

const zipCodeMask = (value) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/(\d{5})(\d)/, "$1-$2");
  return value;
};

const quantityField = document.getElementById("quantityField");
const incrementButton = document.getElementById("increment");
const decrementButton = document.getElementById("decrement");

// Função para incrementar a quantidade
incrementButton.addEventListener("click", () => {
  quantityField.value = parseInt(quantityField.value) + 1;
});

// Função para decrementar a quantidade, com limite mínimo de 1
decrementButton.addEventListener("click", () => {
  if (quantityField.value > 1) {
    quantityField.value = parseInt(quantityField.value) - 1;
  }
});

fetchProduct();