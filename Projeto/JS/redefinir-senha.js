// Projeto/JS/redefinir-senha.js - Versão FINAL e Integrada

import { resetPassword } from './auth.js'; 

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetForm");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const statusDiv = document.getElementById("statusMessage");
    const resetBtn = document.getElementById("resetPasswordBtn");

    
    // 1. EXTRAI O TOKEN DA URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        displayStatus("Token de redefinição não encontrado na URL. Solicite um novo link.", false);
        resetBtn.disabled = true;
    }
    
    const displayStatus = (message, isSuccess = true) => {
        statusDiv.textContent = message;
        statusDiv.className = 'mt-3 text-center ' + (isSuccess ? 'success-message' : 'error-message');
    };

    const resetPasswordIntegration = async (token, password) => {
        try {
            const response = await resetPassword(token, password);
            return response;
            
        } catch (error) {
            let errorMessage = "Erro de conexão ou servidor desconhecido.";
            
            if (error.response) {
                errorMessage = error.response.data.message || `Erro do servidor: Status ${error.response.status}`;
            } else if (error.request) {
                errorMessage = "Falha de rede. Verifique se o Backend Node.js está ativo.";
            }

            throw new Error(errorMessage);
        }
    };


    // Evento de Submissão do Formulário
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        displayStatus(""); 

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword.length < 6) { 
             displayStatus("A nova senha deve ter pelo menos 6 caracteres.", false);
             return;
        }

        if (newPassword !== confirmPassword) {
            displayStatus("As senhas não coincidem. Verifique a digitação.", false);
            return;
        }

        if (!token) {
             displayStatus("Erro: O token de segurança está ausente.", false);
             return;
        }
        
        resetBtn.disabled = true;
        resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redefinindo...';
        
        try {
            await resetPasswordIntegration(token, newPassword);

            displayStatus('Senha redefinida com sucesso! Você será redirecionado para o Login.', true);
            
            setTimeout(() => {
                window.location.href = 'login.html'; 
            }, 3000); 

        } catch (error) {
            displayStatus(error.message, false);
            
        } finally {
            resetBtn.disabled = false;
            resetBtn.innerHTML = 'Redefinir Senha';
        }
    });
});