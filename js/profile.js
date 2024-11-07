document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById("logoutButton");
  const saveButton = document.getElementById("saveButton");
  const editButton = document.getElementById("editButton");
  const cancelButton = document.getElementById("cancelButton");
  const infoCard = document.querySelectorAll(".info-card p");
  
  const originalValues = {}; // Para armazenar os valores originais

  function enableEditMode() {
    infoCard.forEach((card, index) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = card.textContent.trim();
      originalValues[index] = card.textContent; // Salva o valor original
      card.replaceWith(input);
    });
    
    editButton.style.display = "none";
    saveButton.style.display = "inline-block";
    cancelButton.style.display = "inline-block"; // Mostra o botão Cancelar
  }

  async function saveProfile() {
    const inputs = document.querySelectorAll(".info-card input");

    if (inputs.length === 0) {
      console.error("Nenhum campo editável encontrado.");
      return;
    }

    const updatedData = {};
    inputs.forEach((input, index) => {
      const p = document.createElement("p");
      p.textContent = input.value;
      input.replaceWith(p);

      const fieldName = ["completeName", "email", "phone", "address", "cep"];
      updatedData[fieldName[index]] = input.value;
    });

    console.log(updatedData);
    try {
      const response = await fetch("http://localhost:999/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error("Error to save changes to profile");
      }
    } catch (error) {
      console.error("Error:", error);
    }

    editButton.style.display = "inline-block";
    saveButton.style.display = "none";
    cancelButton.style.display = "none"; // Oculta o botão Cancelar
  }

  // Nova função para cancelar as edições
  function cancelEdit() {
    const inputs = document.querySelectorAll(".info-card input");

    if (inputs.length > 0) {
      inputs.forEach((input, index) => {
        const p = document.createElement("p");
        p.textContent = originalValues[index]; // Restaura o valor original
        input.replaceWith(p);
      });
    }

    editButton.style.display = "inline-block"; // Mostra o botão Editar
    saveButton.style.display = "none"; // Oculta o botão Salvar
    cancelButton.style.display = "none"; // Oculta o botão Cancelar
  }

  editButton.addEventListener("click", enableEditMode);
  saveButton.addEventListener("click", saveProfile);
  cancelButton.addEventListener("click", cancelEdit); // Adiciona o listener para cancelar
  logoutButton.addEventListener("click", logout);

  fetchUserData();
});

// Função para buscar dados da API
async function fetchUserData() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/html/auth.html";
      return;
    }
    
    const response = await fetch('http://localhost:999/api/users', {
      method: "GET", 
      headers: {
        "authorization": `${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados: ' + response.statusText);
    }
    const data = await response.json();

    // Preenchendo os dados no HTML
    document.querySelector('.avatar').src = data.avatar;
    document.querySelector('h1').innerText = data.user;
    document.querySelectorAll('.info-card p')[0].innerText = data.completeName; // Nome Completo
    document.querySelectorAll('.info-card p')[1].innerText = data.email; // Email
    document.querySelectorAll('.info-card p')[2].innerText = data.phone; // Telefone
    document.querySelectorAll('.info-card p')[3].innerText = data.address; // Endereço
    document.querySelectorAll('.info-card p')[4].innerText = data.cep; // CEP

  } catch (error) {
    console.error('Erro:', error);
  }
};

// Função para manipular o logout
async function logout() {
  // Remover o token de autenticação do localStorage
  localStorage.removeItem("token");

  // Redirecionar o usuário para a página de login ou inicial
  window.location.href = "/html/auth.html"; // Ajuste o caminho para a sua página de login
};