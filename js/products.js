let produtos = [];

// Carrega os dados do arquivo produtos.json
fetch("http://localhost:999/api/products")
  .then(response => response.json())
  .then(data => {
    produtos = data; // Armazena os produtos na variável
    loadProductDetails(); // Chama a função para mostrar detalhes do produto
  })
  .catch(error => console.error("Erro ao carregar os produtos:", error));

// Função para extrair parâmetros da URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const addCartBtn = document.getElementById("add-to-cart");
addCartBtn.addEventListener("click", addCart);

function addCart() {
  const id = Number(getQueryParam("id"));
  const product = produtos.find(p => p.id === id); // Use 'produtos' aqui
  const productAmount = Number(quantityField.value);

  if (product) {
    console.log(product)
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

async function loadProductDetails() {
  const productId = Number(getQueryParam("id"));
  const produto = produtos.find(p => p.id === productId);

  if (produto) {
    // Configurações do Produto na Página
    document.getElementById("product-name").textContent = produto.nome;
    document.getElementById("product-description").textContent = produto.descricao;
    document.getElementById("stock").textContent =`(${produto.estoque} Disponíveis)`;

    const mainImage = document.getElementById("mainImg");
    const imagesContainer = document.getElementById("product-images");
    mainImage.src = produto.imagens[0];

    // Adiciona miniaturas
    produto.imagens.forEach(imagem => {
      const imgElement = document.createElement("img");
      imgElement.src = imagem;
      imgElement.classList.add("thumbnail");
      imgElement.onclick = () => swapImage(imgElement, mainImage);
      imagesContainer.appendChild(imgElement);
    });

    // Lógica de desconto e parcelas
    const precoOriginal = produto.preco;
    let precoFinal = precoOriginal;

    if (produto.desconto) {
      const desconto = produto.desconto;
      precoFinal = precoOriginal * (1 - desconto / 100);

      // Exibe o preço com desconto e o preço original cortado
        document.getElementById("product-price").textContent = `R$ ${precoFinal.toFixed(2).replace(".", ",")}`;
        document.querySelector(".isProduct-discount").textContent = `De R$ ${precoOriginal.toFixed(2).replace(".", ",")}`;
        document.querySelector(".isProduct-discount").style.textDecoration = "line-through";
        
        // Exibe a porcentagem de desconto
        document.getElementById("product-discount").textContent = `${desconto}% OFF`;
      } else {
        // Sem desconto
        document.getElementById("product-price-without-discount").textContent = `R$ ${precoOriginal.toFixed(2).replace(".", ",")}`;
        document.getElementById("product-discount").textContent = ""; // Oculta o texto de desconto
        document.querySelector(".label-without-discount").style.display = "none";
      }

    // Cálculo de Parcelas
    const numParcelas = Math.min(10, Math.floor(precoFinal / 5));
    const valorParcela = precoFinal / numParcelas;

    if (numParcelas > 1) {
      document.querySelector("#product-installments").textContent = `Ou em até ${numParcelas}x de R$ ${valorParcela.toFixed(2).replace(".", ",")} sem juros`;
    } else {
      document.querySelector("#product-installments").textContent = "";
    }
  } else {
    console.error("Produto não encontrado");
  }
}

// Função para trocar as imagens
function swapImage(thumbnail, mainImage) {
  const tempSrc = mainImage.src;
  mainImage.src = thumbnail.src;
  thumbnail.src = tempSrc;
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