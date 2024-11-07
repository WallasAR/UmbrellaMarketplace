// Função para obter uma cor aleatória
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Função para truncar o nome do produto
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

// Estado para armazenar filtros
const filterState = {
  desconto: false, // Produtos com desconto
  estoque: false
  // Novos filtros podem ser adicionados aqui (e.g., 'category', 'priceRange', etc.)
};

// Função para buscar produtos aplicando filtros
async function fetchProducts(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`http://localhost:999/api/products?${query}`);
  if (!response.ok) {
    throw new Error("Erro ao carregar os produtos");
  }
  return await response.json();
}

// Função para renderizar os produtos
function renderProducts(produtos) {
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = ""; // Limpa os produtos antes de renderizar

  produtos.forEach(produto => {
    const bgColor = getRandomColor();
    const truncatedName = truncateText(produto.nome, 20);

    // Calcula o desconto, se existir
    const desconto = produto.desconto || 0;
    const precoOriginal = produto.preco;
    const precoFinal = desconto ? precoOriginal * (1 - desconto / 100) : precoOriginal;

    // Estrutura do card HTML
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
}

const cardContainer = document.getElementById("card-container");
const noProductsMessage = document.getElementById("no-products-message");
const noProducts = document.getElementById("no-products");
const showFilter = document.getElementById("show-filter");

// Função para aplicar filtros dinamicamente
function applyFilters() {
  const activeFilters = Object.entries(filterState)
    .filter(([, value]) => value) // Pega somente filtros ativos
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  fetchProducts(activeFilters)
    .then(produtos => renderProducts(produtos))
    .catch(error => {
      if (error.message == "Failed to fetch") {
        noProductsMessage.textContent = "Erro, Verifique sua conexão com a internet.";
        showFilter.style.display = "none";
        noProducts.style.display = "block"; // Exibe a mensagem
      }
    });
}

// Função para alternar filtros
function toggleFilter(filterKey, buttonId) {
  filterState[filterKey] = !filterState[filterKey];

  const button = document.getElementById(buttonId);
  button.classList.toggle("active"); // Alterna a classe 'active'

  applyFilters(); // Recarrega produtos com filtros atualizados
}

// Event listeners para filtros
document.getElementById("filter-discount").addEventListener("click", () => toggleFilter("desconto", "filter-discount"));

document.getElementById("filter-stock").addEventListener("click", () => toggleFilter("estoque", "filter-stock"));

// Carrega todos os produtos inicialmente
applyFilters();
