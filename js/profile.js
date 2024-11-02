document.addEventListener('DOMContentLoaded', () => {
  // Função para buscar dados da API
  async function fetchUserData() {
    try {
      const auth = localStorage.getItem("token");
      if (!auth) {
        window.location.href = "/html/auth.html";
        return;
      }
      
      const response = await fetch('http://localhost:999/api/users');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados: ' + response.statusText);
      }
      const data = await response.json();

      // Preenchendo os dados no HTML
      document.querySelector('.avatar').src = data.avatar;
      document.querySelector('h1').innerText = data.username;
      document.querySelectorAll('.info-card p')[0].innerText = data.nomeCompleto; // Nome Completo
      document.querySelectorAll('.info-card p')[1].innerText = data.email; // Email
      document.querySelectorAll('.info-card p')[2].innerText = data.telefone; // Telefone
      document.querySelectorAll('.info-card p')[3].innerText = data.endereco; // Endereço
      document.querySelectorAll('.info-card p')[4].innerText = data.cep; // CEP

    } catch (error) {
      console.error('Erro:', error);
    }
  }

  // Adicionar um listener ao botão de logout
  document.getElementById("logoutButton").addEventListener("click", logout);

  // Chama a função ao carregar a página
  fetchUserData();
});

// Função para manipular o logout
async function logout() {
  // Remover o token de autenticação do localStorage
  localStorage.removeItem("token");

  // Redirecionar o usuário para a página de login ou inicial
  window.location.href = "/login.html"; // Ajuste o caminho para a sua página de login
}