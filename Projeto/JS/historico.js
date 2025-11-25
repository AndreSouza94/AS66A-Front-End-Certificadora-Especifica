// Projeto/JS/historico.js - Versão FINAL e Integrada

import { API_URL_AUTH, setAuthToken } from './auth.js'; 


const removeSelectedBtn = document.getElementById('removeSelected');

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('idUsuario');
    
    const isNotAuthenticated = !token || (typeof token === 'string' && token.trim() === ''); 

    if (!userId || isNotAuthenticated) {
        alert("Você precisa estar logado para ver o histórico. Redirecionando...");
        window.location.href = 'login.html';
        return;
    }
    
    setAuthToken(token);
    loadHistory();

    if (removeSelectedBtn) {
        removeSelectedBtn.disabled = false; 
        removeSelectedBtn.textContent = 'Remover Selecionados';
        removeSelectedBtn.addEventListener('click', removeSelectedSimulations);
    }
    
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
    }
    
    document.getElementById('investmentTable').addEventListener('change', (e) => {
        if (e.target.classList.contains('row-select')) {
            updateSelectAllState();
        }
    });
});

// Helper functions for formatting
const formatCurrency = (value) => {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) return 'R$ 0,00';
    return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatPercent = (value) => {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) return '0,00%';
    return numberValue.toFixed(2).replace('.', ',') + '%';
};


// =======================================================
// FUNÇÕES DE REMOÇÃO (INTEGRAÇÃO COM BACKEND)
// =======================================================

/**
 * Remove uma simulação pelo ID usando o endpoint DELETE /historico.
 */
const deleteHistoryItem = async (idHistorico) => {
    const endpoint = `${API_URL_AUTH}/historico`; 
    try {
        const response = await axios.delete(endpoint, {
            data: { 
                idHistorico: idHistorico, 
                deletarTudo: 'nao' 
            } 
        });
        return response.data;
    } catch (error) {
        let message = "Erro ao deletar item.";
        if (error.response && error.response.data && error.response.data.msg) {
             message = error.response.data.msg;
        }
        throw new Error(message);
    }
}

/**
 * Remove as simulações marcadas.
 */
async function removeSelectedSimulations() {
    const selectedCheckboxes = document.querySelectorAll('#investmentTable .row-select:checked');
    if (selectedCheckboxes.length === 0) {
        alert("Selecione pelo menos uma simulação para remover.");
        return;
    }

    if (!confirm(`Tem certeza que deseja remover ${selectedCheckboxes.length} simulação(ões)?`)) {
        return;
    }

    const removeBtn = document.getElementById('removeSelected');
    removeBtn.disabled = true;
    removeBtn.textContent = 'Removendo...';
    
    let deletionSuccessCount = 0;
    
    try {
        for (const checkbox of selectedCheckboxes) {
            const idToRemove = checkbox.dataset.id; // _id do MongoDB
            try {
                await deleteHistoryItem(idToRemove);
                deletionSuccessCount++;
            } catch (e) {
                console.error(`Falha ao deletar ID ${idToRemove}:`, e.message);
            }
        }

        if (deletionSuccessCount > 0) {
            alert(`${deletionSuccessCount} simulação(ões) excluída(s) com sucesso.`);
        } else {
             alert('Nenhuma simulação foi excluída. Verifique se o item pertence ao seu usuário.');
        }

    } catch (error) {
        alert(`Erro geral na remoção: ${error.message}`);
    } finally {
        loadHistory(); 
        removeBtn.disabled = false;
        removeBtn.textContent = 'Remover Selecionados';
    }
}


// =======================================================
// FUNÇÃO DE CARREGAMENTO (INTEGRAÇÃO COM BACKEND)
// =======================================================

/**
 * Carrega e renderiza as simulações do usuário logado (Integração REAL com Axios).
 */
async function loadHistory() {
    const tableBody = document.getElementById('investmentTable');
    const loadingRow = `<tr><td colspan="13" class="text-center">Carregando histórico do servidor...</td></tr>`;
    tableBody.innerHTML = loadingRow;
    
    try {
        const endpoint = `${API_URL_AUTH}/historico`; // GET /api/auth/historico 
        const response = await axios.get(endpoint);
        
        const userHistory = response.data.msg; 
        
        renderTable(userHistory);
        
    } catch (error) {
        const errorMsg = (error.response && error.response.data && error.response.data.msg) 
                         ? error.response.data.msg : 'Erro de conexão ou token inválido. Por favor, ligue o Backend.';
        const errorRow = `<tr><td colspan="13" class="text-center error-text">Falha ao carregar histórico: ${errorMsg}</td></tr>`;
        tableBody.innerHTML = errorRow;
        console.error("Erro ao buscar histórico:", error.response || error);
    }
}

/**
 * Renderiza a tabela com as simulações, usando os dados do backend.
 */
function renderTable(simulations) {
    const tableBody = document.getElementById('investmentTable');
    tableBody.innerHTML = ''; 
    
    const COLUMNS_COUNT = 13; 
    
    if (simulations.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = `<td colspan="${COLUMNS_COUNT}" class="text-center">Nenhuma simulação encontrada. Adicione uma na Calculadora!</td>`;
        return;
    }

    simulations.forEach(sim => {
        const row = tableBody.insertRow();
        row.setAttribute('data-id', sim._id); 
        
        // Mapeamento e parse dos campos do Backend 
        const valorInicial = parseFloat(sim.valorInicial || 0);
        const rendimentoBruto = parseFloat(sim.rendimentoBruto || 0);
        const impostoIR = parseFloat(sim.impostoRenda || 0);
        const impostoIOF = parseFloat(sim.impostoIOF || 0);
        const lucroLiquidoFinal = parseFloat(sim.lucroLiquido || 0); 
        
        const totalAportado = valorInicial + (parseFloat(sim.valorAporte || 0) * (parseFloat(sim.tempoDias) / 30).toFixed(0));
        const lucroReal = lucroLiquidoFinal - totalAportado;
        
        const percentual = (totalAportado !== 0) ? (lucroReal / totalAportado) * 100 : 0;
        
        const dataHoraFormatada = new Date(sim.createdAt).toLocaleString('pt-BR');
        
        const taxasAdmin = 0; 
        
        row.innerHTML = `
            <td class="checkbox-cell"><input type="checkbox" class="row-select" data-id="${sim._id}"></td>
            <td class="text-left">${dataHoraFormatada}</td>
            <td class="text-center">${sim.tipo || 'N/A'}</td>
            <td class="text-right">${formatCurrency(valorInicial)}</td>
            <td class="text-center">${sim.tempoDias || 'N/A'}</td>
            <td class="text-center">${formatPercent(sim.rentabilidade || 0)}</td>
            <td class="text-right">${formatCurrency(rendimentoBruto)}</td>
            <td class="text-right">${formatCurrency(impostoIR)}</td>     
            <td class="text-right">${formatCurrency(impostoIOF)}</td>    
            <td class="text-right">${formatCurrency(taxasAdmin)}</td>    
            <td class="text-right">${formatCurrency(lucroLiquidoFinal)}</td>
            <td class="text-right">${formatCurrency(lucroReal)}</td>
            <td class="text-center">${formatPercent(percentual)}</td>
        `;
        
        const lucroCell = row.cells[11]; 
        const percentualCell = row.cells[12]; 

        if (lucroReal < 0) {
            lucroCell.classList.add('error-text');
            percentualCell.classList.add('error-text');
        } else if (lucroReal > 0) {
            lucroCell.classList.add('success-text');
            percentualCell.classList.add('success-text');
        }
    });
    
    updateSelectAllState();
}

function toggleSelectAll(event) {
    const isChecked = event.target.checked;
    document.querySelectorAll('#investmentTable .row-select').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

function updateSelectAllState() {
    const allRows = document.querySelectorAll('#investmentTable .row-select');
    const selectedRows = document.querySelectorAll('#investmentTable .row-select:checked');
    const selectAllCheckbox = document.getElementById('selectAll');

    if (selectAllCheckbox) {
        if (allRows.length === 0) {
             selectAllCheckbox.checked = false;
             selectAllCheckbox.disabled = true;
        } else {
             selectAllCheckbox.disabled = false;
             selectAllCheckbox.checked = allRows.length === selectedRows.length;
        }
    }
}