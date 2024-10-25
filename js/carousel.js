// Variáveis de controle do carrossel
let currentIndex = 0;
let slideInterval;

// Carrega as imagens do arquivo imagens.json
fetch('../db/carousel.json')
  .then(response => response.json())
  .then(data => {
    const carouselSlide = document.getElementById('carousel-slide');
    
    // Para cada imagem no JSON, cria um item do carrossel
    data.imagens.forEach(imagem => {
      const carouselItem = document.createElement('div');
      carouselItem.classList.add('carousel-item');

      carouselItem.innerHTML = `
        <img src="${imagem.src}" alt="${imagem.alt}">
      `;

      carouselSlide.appendChild(carouselItem);
    });

    // Inicia o carrossel com a primeira imagem visível
    startCarousel(data.imagens.length);
  })
  .catch(error => console.error('Erro ao carregar as imagens:', error));

// Função para iniciar o carrossel
function startCarousel(totalImages) {
  const carouselSlide = document.querySelector('.carousel-slide');

  // Função para mover o carrossel para a próxima imagem
  slideInterval = setInterval(() => {
    currentIndex++;

    // Volta para o início se passar do total de imagens
    if (currentIndex >= totalImages) {
      currentIndex = 0;
    }

    // Move o carrossel usando translateX para criar a animação
    const offset = -currentIndex * 100; // 100% para cada slide
    carouselSlide.style.transform = `translateX(${offset}%)`;
  }, 10000);
}
