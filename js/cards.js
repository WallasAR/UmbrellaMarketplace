// Global variables
const cardContainer = document.getElementById("card-container");
const noProductsMessage = document.getElementById("no-products-message");
const noProducts = document.getElementById("no-products");
const showFilter = document.getElementById("show-filter");

// background random color generator
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Trunk name medication
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

// Search product with filters
async function fetchProducts() {
  try {
      const filters = getActiveFilters();
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`http://localhost:999/api/product/list?${query}`);
      const result = await response.json();
      if (!response.ok) {
          throw new Error("Error to fetch product list");
      }

      renderProducts(result);
  } catch (error) {
      handleFetchError(error);
  }
}

// Get active filters
function getActiveFilters() {
  const filters = {};
  
  // Discount filter
  const discountButton = document.getElementById("filter-discount");
  if (discountButton.classList.contains("active")) {
    filters.discount = true;
  }

  // stock filter
  const stockButton = document.getElementById("filter-stock");
  if (stockButton.classList.contains("active")) {
    filters.stock = true;
  }

  // More filters soon
  
  return filters;
}

// Exceptions treatment
function handleFetchError(error) {
  if (error.message === "Failed to fetch") {
    noProductsMessage.textContent = "Erro, verifique sua conexão com a internet.";
    showFilter.style.display = "none";
    noProducts.style.display = "block"; // Exibe a mensagem
} else {
    throw new Error("Unknown error occurred");
}
}

// Render products list
function renderProducts(products) {
  if (!Array.isArray(products)) {
      console.error("Not a array", products);
      return;
  }

  cardContainer.innerHTML = ""; // Clean container

  products.forEach(product => {
      const bgColor = getRandomColor();
      const truncatedName = truncateText(product.name, 20);

      // if exist discount, calculate it
      const discount = product.discount || 0;
      const precoOriginal = product.price;
      const precoFinal = discount ? precoOriginal * (1 - discount / 100) : precoOriginal;

      // HTML structure for injection
      const card = `
          <a href="/html/product.html?id=${product.id}" class="card">
              <img src="${product.Images[0].thumb_img}" alt="${product.name}" style="background-color: ${bgColor}">
              <div class="card-content">
                  <h2>${truncatedName}</h2>
                  <div class="price-container">
                      ${discount ? `
                          <div>
                              <h3 style="color: red;">- ${discount}%</h3>
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

// Toggle buttons
function toggleFilter(buttonId) {
  const button = document.getElementById(buttonId);

  button.classList.toggle("active");

  fetchProducts();
}

// Filter button listeners
document.getElementById("filter-discount").addEventListener("click", () => toggleFilter("filter-discount"));
document.getElementById("filter-stock").addEventListener("click", () => toggleFilter("filter-stock"));

// Iniitialize the list of products
fetchProducts();
