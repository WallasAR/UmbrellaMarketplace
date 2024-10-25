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
      // Definindo os elementos principais
      document.getElementById("product-name").textContent = produto.nome;
      document.getElementById("product-price").textContent = `R$ ${produto.preco.toFixed(2).replace(".", ",")}`;
      document.getElementById("product-description").textContent = produto.descricao;

      const mainImage = document.getElementById("mainImg"); // Imagem principal
      const imagesContainer = document.getElementById("product-images"); // Miniaturas

      // Configura a primeira imagem como a principal
      mainImage.src = produto.imagens[0];

      // Adiciona as miniaturas
      produto.imagens.forEach(imagem => {
        const imgElement = document.createElement("img");
        imgElement.src = imagem;
        imgElement.classList.add("thumbnail");
        imgElement.onclick = () => swapImage(imgElement, mainImage);
        imagesContainer.appendChild(imgElement);
      });
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
