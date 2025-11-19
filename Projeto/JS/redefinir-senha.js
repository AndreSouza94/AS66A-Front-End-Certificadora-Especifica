// Projeto/JS/redefinir-senha.js - Versão final e integrada

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
    
    /**
     * Exibe uma mensagem de status na tela.
     */
    const displayStatus = (message, isSuccess = true) => {
        statusDiv.textContent = message;
        statusDiv.className = 'mt-3 text-center ' + (isSuccess ? 'success-message' : 'error-message');
    };

    /**
     * Função REAL de Redefinição de Senha.
     */
    const resetPasswordIntegration = async (token, password) => {
        try {
            // Chamada ao serviço centralizado
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

        // 1. Validação de Senha (mínimo de 6 caracteres)
        if (newPassword.length < 6) { 
             displayStatus("A nova senha deve ter pelo menos 6 caracteres.", false);
             return;
        }

        // 2. Validação de Confirmação de Senha
        if (newPassword !== confirmPassword) {
            displayStatus("As senhas não coincidem. Verifique a digitação.", false);
            return;
        }

        // 3. Validação do Token
        if (!token) {
             displayStatus("Erro: O token de segurança está ausente.", false);
             return;
        }
        
        resetBtn.disabled = true;
        resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redefinindo...';
        
        try {
            await resetPasswordIntegration(token, newPassword);

            displayStatus('Senha redefinida com sucesso! Você será redirecionado para o Login.', true);
            
            // Redireciona para o login após 3 segundos
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