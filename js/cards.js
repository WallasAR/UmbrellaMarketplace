function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Função para truncar o nome do produto
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};


// Carrega os dados do arquivo produtos.json
fetch("../db/products.json")
  .then(response => response.json())
  .then(produtos => {
    const cardContainer = document.getElementById("card-container");

    produtos.forEach(produto => {
      bgColor = getRandomColor();
      const truncatedName = truncateText(produto.nome, 20); // Limite de 20 caracteres

      // Calcula o desconto, se existir
      const desconto = produto.desconto || 0;
      const precoOriginal = produto.preco;
      const precoFinal = desconto ? precoOriginal * (1 - desconto / 100) : precoOriginal;
      
      // Adiciona a estrutura HTML do card com o sistema de desconto
      const card = `
        <a href="/html/product.html?id=${produto.id}" class="card">
          <img src="${produto.imagem}" alt="${produto.nome}" style="background-color: ${bgColor}">
          <div class="card-content">
            <h2>${truncatedName}</h2>
            <div class="price-container">
              ${desconto ? `
                <div>
                  <h3 style="color: red;">- ${desconto}%</h3>
                  <p style="text-decoration: line-through;">De R$ ${precoOriginal.toFixed(2).replace(".", ",")}</p>
                </div>
                <div>
                    <p>por</p>
                    <h3>R$ ${precoFinal.toFixed(2).replace(".", ",")}</h3>
                </div>
              ` : `
                <h3 style="color: #000">R$ ${precoOriginal.toFixed(2).replace(".", ",")}</h3>
              `}
            </div>
          </div>
        </a>
      `;
      cardContainer.innerHTML += card;
    });
  })
  .catch(error => console.error("Erro ao carregar os produtos:", error));
