import { forgotPassword } from './auth.js'; 

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("recoverForm");
    const emailInput = document.getElementById("recoveryEmail");
    const statusDiv = document.getElementById("statusMessage");
    const sendBtn = document.getElementById("sendRecoveryBtn");

    const displayStatus = (message, isSuccess = true) => {
        statusDiv.textContent = message;
        statusDiv.className = 'mt-3 text-center ' + (isSuccess ? 'success-message' : 'error-message');
    };
    
    const clearStatus = () => {
        statusDiv.textContent = '';
        statusDiv.className = 'mt-3 text-center';
    };

    const forgotPasswordIntegration = async (email) => {
        try {
            // Chamada ao serviço centralizado
            const response = await forgotPassword(email);
            return response;
            
        } catch (error) {
            let errorMessage = "Erro de conexão ou servidor desconhecido.";

            if (error.response) {
                // Erro HTTP: usa a mensagem de erro do Backend
                errorMessage = error.response.data.message || `Erro do servidor: Status ${error.response.status}`;
            } else if (error.request) {
                errorMessage = "Falha de rede. Verifique se o Backend Node.js está ativo.";
            }

            throw new Error(errorMessage);
        }
    };


    // Evento de Submissão do Formulário (Async/Await)
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearStatus();

        const email = emailInput.value.trim();

        if (!email) {
            displayStatus("O campo de e-mail é obrigatório.", false);
            return;
        }

        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        try {
            const result = await forgotPasswordIntegration(email);
            displayStatus(result.message, true);
            emailInput.value = '';

        } catch (error) {
            displayStatus(error.message, false);
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = 'Enviar Instruções';
        }
    });
});