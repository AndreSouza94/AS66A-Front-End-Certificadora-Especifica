// Projeto/JS/login.js - Versão final e integrada

import { registerUser, loginUser } from './auth.js'; 

// Referências aos elementos
const cardFlip = document.getElementById("cardFlip");
const toRegister = document.getElementById("toRegister");
const toLogin = document.getElementById("toLogin");

// Alterna entre os formulários de login e cadastro
toRegister.addEventListener("click", (e) => {
    e.preventDefault();
    cardFlip.classList.add("flip");
});

toLogin.addEventListener("click", (e) => {
    e.preventDefault();
    cardFlip.classList.remove("flip");
});


// --- Função de login (Integração REAL) ---
document.querySelector(".form-side form").addEventListener("submit", async function(e) {
    e.preventDefault();

    // Revertido para document.getElementById para garantir que os valores sejam lidos
    const loginEmail = document.getElementById("loginEmail").value.trim(); 
    const loginSenha = document.getElementById("loginSenha").value.trim();
    const loginBtn = this.querySelector('button[type="submit"]');

    if (!loginEmail || !loginSenha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Aguarde...';

    try {
        await loginUser(loginEmail, loginSenha);
        
        window.location.href = "index.html"; 

    } catch (error) {
        let message = "Erro ao tentar fazer login. Verifique as credenciais ou a conexão.";
        if (error.response && error.response.data && error.response.data.message) {
             message = error.response.data.message;
        } else if (error.message.includes("Network")) {
             message = "Falha de rede. Verifique se o Backend Node.js está ativo.";
        }
        alert(message); 
        
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Entrar';
    }
});

// --- Função de cadastro (Integração REAL) ---
document.querySelector(".form-back form").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    // CORREÇÃO: Usando document.getElementById (método mais compatível)
    const nome = document.getElementById("nome").value.trim();
    const cadEmail = document.getElementById("cadEmail").value.trim();
    const cadCpf = document.getElementById("cadCpf").value.trim(); // Campo CPF
    const cadSenha = document.getElementById("cadSenha").value.trim();
    const confirmaSenha = document.getElementById("confirmaSenha").value.trim();
    const registerBtn = this.querySelector('button[type="submit"]');


    if (!nome || !cadEmail || !cadCpf || !cadSenha || !confirmaSenha) {
        alert("Todos os campos são obrigatórios.");
        return;
    }

    if (cadSenha !== confirmaSenha) {
        alert("As senhas digitadas não coincidem.");
        return;
    }
    
    if (cadSenha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = 'Cadastrando...';

    try {
        await registerUser(nome, cadEmail, cadCpf, cadSenha);
        
        alert("Cadastro realizado com sucesso! Faça seu login.");
        
        cardFlip.classList.remove("flip"); 
        
    } catch (error) {
        let message = "Erro ao tentar cadastrar. Verifique os dados.";
        if (error.response && error.response.data && error.response.data.message) {
             message = error.response.data.message;
        } else if (error.message.includes("Network")) {
             message = "Falha de rede. Verifique se o Backend Node.js está ativo.";
        }
        alert(message);
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Cadastrar';
    }
});