export const API_URL_AUTH = 'http://localhost:3000/api/auth'; 

/**
 * Configura ou remove o token JWT no cabeçalho de todas as requisições Axios.
 * @param {string | null} token O token JWT
 */
export const setAuthToken = (token) => {
    if (typeof axios === 'undefined') {
        console.error("Axios não está carregado. Verifique o script no HTML.");
        return;
    }
    
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

// --- Funções de Serviço de Autenticação (Chamadas Axios) ---

export const registerUser = async (name, email, cpf, password) => {
    const response = await axios.post(`${API_URL_AUTH}/register`, { name, email, cpf, password });
    return response.data;
};

export const loginUser = async (email, password) => {
    const response = await axios.post(`${API_URL_AUTH}/login`, { email, password });
    
    const data = response.data;

    localStorage.setItem("token", data.token);
    localStorage.setItem("idUsuario", data.data.user._id); 
    localStorage.setItem("userName", data.data.user.name);
    
    setAuthToken(data.token);

    return data;
};

export const forgotPassword = async (email) => {
    const response = await axios.post(`${API_URL_AUTH}/forgot-password`, { email });
    return response.data;
};

export const resetPassword = async (token, newPassword) => {
    const response = await axios.patch(`${API_URL_AUTH}/reset-password/${token}`, { password: newPassword });
    
    if (response.data.token) {
         localStorage.setItem('token', response.data.token); 
    }

    return response.data;
};


// --- Lógica de UI do Header (adaptada ao novo CSS) ---

function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('userName'); 
    setAuthToken(null); 
    window.location.href = 'index.html'; 
}

/**
 * Atualiza o cabeçalho dinamicamente. No novo CSS, ele injeta os botões no <nav class="main-nav">
 */
function updateHeaderUI() {
    const userName = localStorage.getItem('userName');
    const token = localStorage.getItem('token');
    
    // O novo CSS não tem um div separado para actions. Vamos buscar o link de "Acessar Conta"
    const accessLink = document.querySelector('.main-nav .btn-header');
    
    if (!accessLink) return;
    
    if (token && userName) {
        setAuthToken(token); // Garante que o token está setado
        
        // Remove o link "Acessar Conta"
        accessLink.remove();
        
        // Cria a área de ações do usuário (para "Olá, Nome" e "Sair")
        const headerActions = document.querySelector('.site-header');
        if (!headerActions) return;

        // Exibe "Olá, Nome" (primeiro nome)
        const welcomeSpan = document.createElement('span');
        welcomeSpan.className = 'acesso-link logged-in-user'; 
        welcomeSpan.textContent = `Olá, ${userName.split(' ')[0]}`;

        // Botão/Link de Logout
        const logoutLink = document.createElement('a');
        logoutLink.className = 'btn-header'; 
        logoutLink.href = '#';
        logoutLink.textContent = 'Sair';
        logoutLink.addEventListener('click', handleLogout);

        // Cria um novo container temporário para manter o espaçamento do CSS
        const actionContainer = document.createElement('div');
        actionContainer.classList.add('header-actions');
        actionContainer.appendChild(welcomeSpan);
        actionContainer.appendChild(logoutLink);
        
        headerActions.appendChild(actionContainer);

    } else {
        // Se não está logado, o link "Acessar Conta" já está no HTML (index.html, beneficios.html)
    }
}

document.addEventListener('DOMContentLoaded', updateHeaderUI);