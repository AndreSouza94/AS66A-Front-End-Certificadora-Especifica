import { API_URL_AUTH, setAuthToken } from './auth.js'; 

// Variável global para armazenar a instância do gráfico
let chartInstance = null;
let lastHistoryData = null; // Armazena o payload da última simulação

// ===== MOCK DE TAXAS (Mantido para exibição no card lateral) =====
const taxas = {
  selic: 15.00,
  cdi: 14.90,
  ipca: 5.17,
  poupança: 8.37 
};

// =======================================================
// INICIALIZAÇÃO E CHECK DE AUTENTICAÇÃO 
// =======================================================
(function() {
    const token = localStorage.getItem('token');
    
    // Verifica se o token é nulo, undefined, ou uma string vazia/só de espaços
    const isNotAuthenticated = !token || (typeof token === 'string' && token.trim() === ''); 

    if (isNotAuthenticated) { 
        alert('Você precisa estar logado para acessar a calculadora. Redirecionando para a tela de Login.');
        window.location.href = 'login.html'; 
    } else {
        // Se o token for válido, configura o Axios com ele
        setAuthToken(token);
    }
    
})();


// =======================================================
// FUNÇÕES DE SERVIÇO PARA CÁLCULO E SALVAMENTO
// =======================================================

/**
 * Chama o endpoint POST /calcular do backend.
 * @param {object} data - Dados da simulação.
 * @param {string} shouldSave - 'sim' ou 'nao'.
 */
const calculateInvestment = async (data, shouldSave = 'nao') => {
    const endpoint = `${API_URL_AUTH}/calcular`; 
    
    // Adiciona os campos opcionais ao payload
    const payload = {
        ...data,
        salvarHistorico: shouldSave 
    };
    
    try {
        const response = await axios.post(endpoint, payload);
        // O backend retorna o objeto de simulação/histórico dentro de .msg
        return response.data.msg; 
    } catch (error) {
        let message = "Erro ao realizar o cálculo. Verifique os dados.";
        if (error.response && error.response.data && error.response.data.msg) {
             message = error.response.data.msg; 
        } else if (error.message.includes("Network")) {
             message = "Falha de rede. Verifique se o Backend Node.js está ativo ou se você está autenticado (Token inválido).";
        }
        throw new Error(message);
    }
}


// =======================================================
// UTILITÁRIOS
// =======================================================
function cleanCurrency(value) {
    if (typeof value !== 'string') return parseFloat(value) || 0;
    // Remove pontos de milhar e troca vírgula decimal por ponto
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
}


// =======================================================
// LÓGICA DO FORMULÁRIO (CHAMADA AO BACKEND)
// =======================================================
const form = document.getElementById("form-calculadora");
const resultadoContainer = document.getElementById("resultado-container");
const chartSection = document.getElementById("chart-section");
const inputRentabilidade = document.getElementById("rentabilidade");
const inputAporteMensal = document.getElementById("aporte-mensal");
const checkAporte = document.getElementById("check-aporte");
const grupoAporte = document.getElementById("grupo-aporte");
const addHistoryBtn = document.getElementById("addHistoryBtn"); 


checkAporte.addEventListener('change', () => {
    if (checkAporte.checked) {
        grupoAporte.classList.remove('hidden');
        inputAporteMensal.disabled = false;
        inputAporteMensal.value = '0,00'; 
    } else {
        grupoAporte.classList.add('hidden');
        inputAporteMensal.disabled = true;
        inputAporteMensal.value = '0,00'; 
    }
});

inputAporteMensal.addEventListener('blur', (e) => {
    e.target.value = cleanCurrency(e.target.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
});


// === LISTENER: SUBMISSÃO DO FORMULÁRIO (APENAS CALCULA E EXIBE) ===
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Reseta o estado
    lastHistoryData = null;
    addHistoryBtn.classList.add('hidden'); 
    chartSection.classList.add('hidden'); 

    // Pega e limpa os dados
    const tipo = document.getElementById("tipo").value;
    const valorInicial = cleanCurrency(document.getElementById("valor").value);
    const dataInicialStr = document.getElementById("data-inicial").value;
    const dataFinalStr = document.getElementById("data-final").value;
    const rentabilidade = cleanCurrency(inputRentabilidade.value);
    
    let aporte = 0;
    if (checkAporte.checked) {
        aporte = cleanCurrency(inputAporteMensal.value);
    }

    if (new Date(dataInicialStr) >= new Date(dataFinalStr)) {
        alert("A Data Final deve ser posterior à Data Inicial.");
        return;
    }
    
    // Prepara os dados (enviando datas como Timestamps e aporte)
    const dataInicialTimestamp = new Date(dataInicialStr).getTime();
    const dataFinalTimestamp = new Date(dataFinalStr).getTime();

    const requestData = {
        tipo,
        valorInicial,
        dataInicial: dataInicialTimestamp, 
        dataFinal: dataFinalTimestamp,     
        rentabilidade,
        aporte: aporte,
    };

    const calcularBtn = e.target.querySelector('.btn-calcular');
    calcularBtn.disabled = true;
    calcularBtn.textContent = 'Calculando...';

    try {
        // 4. Executa a Simulação (Chamada ao Backend, sem salvar)
        const resultados = await calculateInvestment(requestData, 'nao'); // shouldSave = 'nao'
        
        // 5. Mapeia os resultados do backend para o formato do frontend
        const vInicial = parseFloat(resultados.valorInicial);
        const rendimentoB = parseFloat(resultados.rendimentoBruto);
        const tempoDias = resultados.tempoDias;

        // O backend retorna os valores já calculados e líquidos
        const impostosTotais = resultados.impostoRenda + resultados.impostoIOF;
        const valorFinalLiquido = resultados.lucroLiquido; // O lucroLiquido do backend é o valor Final Liquido
        const totalAportado = vInicial + (resultados.valorAporte * (tempoDias / 30).toFixed(0));
        const lucroLiquidoReal = valorFinalLiquido - totalAportado; 

        const mappedResults = {
            valorFinalBruto: vInicial + rendimentoB, 
            rendimentoBruto: rendimentoB, 
            impostoIR: resultados.impostoRenda,
            impostoIOF: resultados.impostoIOF,
            taxas: 0, 
            valorFinalLiquido: valorFinalLiquido, 
            lucroLiquido: lucroLiquidoReal, 
            percentual: (totalAportado !== 0) ? (lucroLiquidoReal / totalAportado) * 100 : 0,
            tempoDiasTotal: tempoDias,
            payloadRequest: requestData 
        };

        // 6. Renderiza o Resultado
        renderResultado(mappedResults);
        
        // 7. Renderiza o Gráfico com série simplificada
        const seriesSimples = [
            { periodo: 'Início', patrimonio: vInicial, aportado: vInicial },
            { periodo: `${tempoDias} dias (Final)`, patrimonio: mappedResults.valorFinalLiquido, aportado: totalAportado }
        ];
        renderChart(seriesSimples); 
        
        // 8. Armazena os dados do último cálculo e exibe o botão de salvar
        lastHistoryData = mappedResults.payloadRequest;
        addHistoryBtn.classList.remove('hidden'); 
        
    } catch (error) {
        alert(`Erro ao calcular: ${error.message}`);
    } finally {
        calcularBtn.disabled = false;
        calcularBtn.textContent = 'Calcular';
    }
});

// === LISTENER: ADICIONAR AO HISTÓRICO (FAZ REQUISIÇÃO DE SALVAMENTO) ===
if (addHistoryBtn) {
    addHistoryBtn.addEventListener('click', async () => {
        if (!lastHistoryData) {
            alert("Nenhum cálculo recente para salvar.");
            return;
        }

        addHistoryBtn.disabled = true;
        addHistoryBtn.textContent = 'Salvando...';

        try {
            // Re-executa a requisição, mas com shouldSave = 'sim'
            await calculateInvestment(lastHistoryData, 'sim'); 
            
            alert('Simulação salva no Histórico com sucesso!');
            addHistoryBtn.classList.add('hidden'); // Oculta após salvar

        } catch (error) {
            alert(`Erro ao salvar histórico: ${error.message}`);
        } finally {
            addHistoryBtn.disabled = false;
            addHistoryBtn.textContent = 'Adicionar ao Histórico';
        }
    });
}


/**
 * Renderiza os resultados numéricos.
 */
function renderResultado(r) {
    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatPercent = (value) => r.percentual.toFixed(2).replace('.', ',') + '%';
    
    const impostosTotais = r.impostoIR + r.impostoIOF + r.taxas; 
    
    document.getElementById("res-bruto").textContent = formatCurrency(r.valorFinalBruto);
    document.getElementById("res-rendimento-bruto").textContent = formatCurrency(r.rendimentoBruto);
    document.getElementById("res-imposto").textContent = formatCurrency(impostosTotais);
    document.getElementById("res-liquido").textContent = formatCurrency(r.valorFinalLiquido);
    document.getElementById("res-lucro-liquido").textContent = formatCurrency(r.lucroLiquido);
    document.getElementById("res-percentual").textContent = formatPercent(r.percentual);
    
    resultadoContainer.classList.remove('hidden');
    resultadoContainer.scrollIntoView({ behavior: "smooth" });
}


function renderChart(seriesData) {
    const chartContainer = document.querySelector('#chart-section .form-container');
    const chartSection = document.getElementById("chart-section");
    
    // ... (Lógica de renderização de gráfico, garantindo que o gráfico seja exibido) ...
    if (typeof Chart === 'undefined') {
        chartSection.classList.remove('hidden');
        chartContainer.innerHTML = '<p class="text-center" style="color: #ccc; padding: 20px;">ERRO: Biblioteca Chart.js não carregada. Adicione o script ao HTML para visualizar o gráfico.</p>';
        return; 
    }
    
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    chartContainer.innerHTML = '<canvas id="patrimonio-chart"></canvas>';
    const chartCanvas = document.getElementById('patrimonio-chart');
    
    try {
        const labels = seriesData.map(d => d.periodo);
        const patrimonio = seriesData.map(d => d.patrimonio);
        const aportado = seriesData.map(d => d.aportado);
        
        chartInstance = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Patrimônio Total (Valor de Mercado)',
                        data: patrimonio,
                        borderColor: '#ffa533', 
                        backgroundColor: 'rgba(255, 165, 51, 0.2)',
                        fill: true,
                        tension: 0.2
                    }, 
                    {
                        label: 'Total Aportado (Capital Investido)',
                        data: aportado,
                        borderColor: '#007bff', 
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                        fill: false,
                        tension: 0.2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    // ... (Configurações de escala)
                },
                plugins: {
                    // ... (Configurações de plugin)
                }
            }
        });

        chartSection.classList.remove('hidden');
        chartSection.scrollIntoView({ behavior: "smooth" });

    } catch (e) {
        console.error("Erro ao renderizar o gráfico Chart.js:", e);
        chartSection.classList.remove('hidden');
        chartContainer.innerHTML = '<p class="text-center" style="color: #ccc; padding: 20px;">Houve um erro interno ao gerar o gráfico. O cálculo funcionou, mas a visualização falhou. Verifique o console para detalhes.</p>';
        chartInstance = null;
        return;
    }
}


function renderTaxas() {
  const taxasContainer = document.getElementById("taxas-container");
  taxasContainer.innerHTML = ''; 
  Object.entries(taxas).forEach(([chave, valor]) => {
    const card = document.createElement("div");
    card.classList.add("card-taxa");
    const valorFormatado = valor.toFixed(2).replace('.', ',');
    card.innerHTML = `
      <div class="label">${chave.toUpperCase()}</div>
      <div class="valor">${valorFormatado}%</div>
    `;
    taxasContainer.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
    const taxasContainer = document.getElementById("taxas-container");
    if (taxasContainer) {
        renderTaxas();
    }
});