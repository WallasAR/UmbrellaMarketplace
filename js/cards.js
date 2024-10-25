function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Carrega os dados do arquivo produtos.json
fetch("db/products.json")
  .then(response => response.json())
  .then(produtos => {
    const cardContainer = document.getElementById("card-container");

    produtos.forEach(produto => {
      bgColor = getRandomColor();
      const card = `
        <a href="/html/product.html?id=${produto.id}" class="card">
          <img src="${produto.imagem}" alt="${produto.nome}" style="background-color: ${bgColor}">
          <div class="card-content">
            <h2>${produto.nome}</h2>
            <h4>R$ ${produto.preco.toFixed(2).replace(".", ",")}</h4>
          </div>
        </a>
      `;
      cardContainer.innerHTML += card;
    });
  })
  .catch(error => console.error("Erro ao carregar os produtos:", error));
