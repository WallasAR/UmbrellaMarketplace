// Função para extrair parâmetros da URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Carrega os dados do arquivo produtos.json
fetch("../db/products.json")
  .then(response => response.json())
  .then(produtos => {
    const productId = Number(getQueryParam("id"));
    const produto = produtos.find(p => p.id === productId);

    if (produto) {
      // Configurações básicas
      document.getElementById("product-name").textContent = produto.nome;
      document.getElementById("product-description").textContent = produto.descricao;

      const mainImage = document.getElementById("mainImg");
      const imagesContainer = document.getElementById("product-images");
      mainImage.src = produto.imagens[0];

      // Adiciona as miniaturas
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

      // Exemplo de condição para desconto (20% se o preço for maior que 5)
      if (produto.desconto) {
        const desconto = produto.desconto; // Percentual de desconto
        const precoFinal = precoOriginal * (1 - desconto / 100);
          
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

      // Cálculo das parcelas (até 10x sem juros, por exemplo)
      const numParcelas = Math.min(10, Math.floor(precoFinal / 5)); // Limita a parcelas de acordo com o valor do produto      
      const valorParcela = precoFinal / numParcelas;

      if (numParcelas > 1) {
        document.querySelector("#product-installments").textContent = `Ou em até ${numParcelas}x de R$ ${valorParcela.toFixed(2).replace(".", ",")} sem juros`;
      } else {
        document.querySelector("#product-installments").textContent = ""; // Oculta o texto de parcelamento se não houver parcelas
      }
    } else {
      console.error("Produto não encontrado");
    }
  })
  .catch(error => console.error("Erro ao carregar os produtos:", error));

// Função para trocar as imagens entre a principal e a miniatura
function swapImage(thumbnail, mainImage) {
  const tempSrc = mainImage.src;
  mainImage.src = thumbnail.src;
  thumbnail.src = tempSrc;
}

const handleZipCode = (event) => {
  let input = event.target
  input.value = zipCodeMask(input.value)
}


const zipCodeMask = (value) => {
  if (!value) return ""
  value = value.replace(/\D/g,'')
  value = value.replace(/(\d{5})(\d)/,'$1-$2')
  return value
}