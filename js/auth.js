console.clear();

const loginBtn = document.getElementById("login");
const signupBtn = document.getElementById("signup");

loginBtn.addEventListener("click", (e) => {
	let parent = e.target.parentNode.parentNode;
	Array.from(e.target.parentNode.parentNode.classList).find((element) => {
		if(element !== "slide-up") {
			parent.classList.add("slide-up")
		}else{
			signupBtn.parentNode.classList.add("slide-up")
			parent.classList.remove("slide-up")
		}
	});
});

signupBtn.addEventListener("click", (e) => {
	let parent = e.target.parentNode;
	Array.from(e.target.parentNode.classList).find((element) => {
		if(element !== "slide-up") {
			parent.classList.add("slide-up")
		}else{
			loginBtn.parentNode.parentNode.classList.add("slide-up")
			parent.classList.remove("slide-up")
		}
	});
});

// Seleção dos elementos DOM
const successModal = document.getElementById("successModal");

const usernameInput = document.getElementById("signup-user");
const passwordInput = document.getElementById("signup-pass");
const signupButton = document.getElementById("signup-submit");

const singinUserInput = document.getElementById("signin-user");
const singinPassInput = document.getElementById("signin-pass"); 
const signinButton = document.getElementById("signin-submit");

const errorModal = document.getElementById("errorModal");
const closeErrorBtn = document.getElementById("closeError");
const errorMessageLabel = document.getElementById("errorMessageLabel");

// Eventos de login e signup
signupButton.addEventListener("click", signUp);
signinButton.addEventListener("click", signIn);

async function signUp() {
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    // Resetar estados anteriores
    errorMessageLabel.classList.add("hidden");
    usernameInput.classList.remove("error-border");
    passwordInput.classList.remove("error-border");
    
    if (username && password) {
        try {
            const response = await fetch("http://localhost:999/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user: username, pass: password }),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                // Mostrar modal de sucesso
                successModal.classList.remove("hidden");
    
                // Redirecionar após 3 segundos
                setTimeout(() => {
                    window.history.back();
                }, 3000); // 3000 ms = 3 segundos
            } else {
                // Mostrar modal de erro
                document.getElementById("errorMessage").innerText = result.message;
                errorModal.classList.remove("hidden");
            }
        } catch (error) {
            console.error("Erro:", error);
            document.getElementById("errorMessage").innerText = "Erro ao tentar registrar. Tente novamente mais tarde.";
            errorModal.classList.remove("hidden");
        }
    } else {
        // Exibir borda vermelha e mensagem de erro
        if (!username) {
            usernameInput.classList.add("error-border");
        }
        if (!password) {
            passwordInput.classList.add("error-border");
        }
    
        errorMessageLabel.innerText = "Preencha todos os campos.";
        errorMessageLabel.classList.remove("hidden");
                setTimeout(() => {
                    errorMessageLabel.classList.add("hidden");
                }, 5000)
    
        // Adicionar fade out para a borda
        setTimeout(() => {
            usernameInput.classList.remove("error-border");
            passwordInput.classList.remove("error-border");
        }, 5000); // 2000 ms = 2 segundos
    }
};

// Função para fechar o modal de erro
closeErrorBtn.addEventListener("click", () => {
    errorModal.classList.add("hidden");
});

async function signIn() {
    // get values from form inputs
    const username = singinUserInput.value;
    const password = singinPassInput.value;

    // Reset status to error treatments
    errorMessageLabel.classList.add("hidden");
    usernameInput.classList.remove("error-border");
    passwordInput.classList.remove("error-border");

    if (username && password) {
        try {
            const response = await fetch("http://localhost:999/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user: username, pass: password })
            });

            const data = await response.json();

            if (response.ok) {
                // Mostrar modal de sucesso
                successModal.classList.remove("hidden");
                
                localStorage.setItem("token", data.token);

                // Redirecionar após 3 segundos
                setTimeout(() => {
                    window.history.back();
                }, 3000); // 3000 ms = 3 segundos
            } else {
                // Mostrar modal de erro
                document.getElementById("errorMessage").innerText = data.message;
                errorModal.classList.remove("hidden");
            }
        } catch (error) {
            console.error("Erro:", error);
            document.getElementById("errorMessage").innerText = "Erro ao tentar registrar. Tente novamente mais tarde.";
            errorModal.classList.remove("hidden");
        }
    } else {
        // Exibir borda vermelha e mensagem de erro
        if (!username) {
            usernameInput.classList.add("error-border");
        }
        if (!password) {
            passwordInput.classList.add("error-border");
        }
    
        errorMessageLabel.innerText = "Preencha todos os campos.";
        errorMessageLabel.classList.remove("hidden");
                setTimeout(() => {
                    errorMessageLabel.classList.add("hidden");
                }, 5000)
    
        // Adicionar fade out para a borda
        setTimeout(() => {
            usernameInput.classList.remove("error-border");
            passwordInput.classList.remove("error-border");
        }, 5000); // 2000 ms = 2 segundos
    }
}