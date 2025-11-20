// Projeto/JS/calculadora.js - Versão FINAL INTEGRADA (Com Correção de Consistência no Display)

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
// INICIALIZAÇÃO E CHECK DE AUTENTICAÇÃO (Robusta)
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
// FUNÇÕES DE SERVIÇO PARA CÁLCULO E SALVAMENTO (CHAMADA REAL)
// =======================================================

/**
 * Chama o endpoint POST /calcular do backend.
 */
const calculateInvestment = async (data, shouldSave = 'nao') => {
    const endpoint = `${API_URL_AUTH}/calcular`; 
    
    const payload = {
        ...data,
        salvarHistorico: shouldSave 
    };
    
    try {
        const response = await axios.post(endpoint, payload);
        return response.data.msg; 
    } catch (error) {
        let message = "Erro de conexão ao calcular. Verifique o Backend.";
        if (error.response && error.response.data && error.response.data.msg) {
             message = error.response.data.msg; 
        } else if (error.message.includes("Network")) {
             message = "Falha de rede. Verifique se o Backend Node.js está ativo.";
        }
        throw new Error(message);
    }
}


// =======================================================
// UTILITÁRIOS
// =======================================================
function cleanCurrency(value) {
    if (typeof value !== 'string') return parseFloat(value) || 0;
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
}


// =======================================================
// LÓGICA DO FORMULÁRIO (CHAMADA REAL AO BACKEND)
// =======================================================
const form = document.getElementById("form-calculadora");
const resultadoContainer = document.getElementById("resultado-container");
const chartSection = document.getElementById("chart-section");
const historyWrapper = document.getElementById("history-wrapper"); 
const addHistoryBtn = document.getElementById("addHistoryBtn"); 

// Referências de input para eventos
const inputAporteMensal = document.getElementById("aporte-mensal");
const checkAporte = document.getElementById("check-aporte");
const grupoAporte = document.getElementById("grupo-aporte");


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


// === LISTENER: SUBMISSÃO DO FORMULÁRIO (CHAMADA REAL) ===
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    lastHistoryData = null;
    addHistoryBtn.classList.add('hidden'); 
    if (historyWrapper) historyWrapper.classList.add('hidden'); 
    chartSection.classList.add('hidden'); 

    // Pega os dados dos campos (acessando diretamente no momento da submissão)
    const tipo = document.getElementById("tipo").value;
    const valorInicial = cleanCurrency(document.getElementById("valor").value);
    const dataInicialStr = document.getElementById("data-inicial").value;
    const dataFinalStr = document.getElementById("data-final").value;
    const rentabilidade = cleanCurrency(document.getElementById("rentabilidade").value);
    
    let aporte = 0;
    // O seu HTML possui um checkbox para aporte, então usamos a verificação correta:
    if (document.getElementById("check-aporte").checked) {
        aporte = cleanCurrency(document.getElementById("aporte-mensal").value);
    }

    if (new Date(dataInicialStr) >= new Date(dataFinalStr)) {
        alert("A Data Final deve ser posterior à Data Inicial.");
        return;
    }
    
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
        // 4. Executa a Simulação (Chamada REAL ao Backend)
        const resultados = await calculateInvestment(requestData, 'nao'); 
        
        // 5. Mapeia os resultados do backend para o formato do frontend
        // TRATAMENTO ROBUSTO: || 0 garante que a formatação não receba null/undefined.
        const vInicial = parseFloat(resultados.valorInicial || 0);
        const rendimentoB = parseFloat(resultados.rendimentoBruto || 0);
        const tempoDias = parseFloat(resultados.tempoDias || 0);

        // Garante que todos os resultados do Backend sejam tratados como números
        const impostosTotais = parseFloat(resultados.impostoRenda || 0) + parseFloat(resultados.impostoIOF || 0);
        const valorFinalLiquido = parseFloat(resultados.lucroLiquido || 0);
        const totalAportado = vInicial + (parseFloat(resultados.valorAporte || 0) * (tempoDias / 30).toFixed(0));
        const lucroLiquidoReal = valorFinalLiquido - totalAportado; 

        // CORREÇÃO FINAL: Garante que o Valor Final Bruto seja aritmeticamente consistente com os resultados
        const valorFinalBrutoConsistente = valorFinalLiquido + impostosTotais;

        const mappedResults = {
            // CORRIGIDO: Usa o valor Bruto que é consistente com o Valor Líquido
            valorFinalBruto: valorFinalBrutoConsistente, 
            rendimentoBruto: rendimentoB, 
            impostoIR: parseFloat(resultados.impostoRenda || 0),
            impostoIOF: parseFloat(resultados.impostoIOF || 0),
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
            { periodo: 'Início', patrimonio: totalAportado, aportado: totalAportado },
            { periodo: `${mappedResults.tempoDiasTotal} dias (Final)`, patrimonio: mappedResults.valorFinalLiquido, aportado: totalAportado }
        ];
        renderChart(seriesSimples); 
        
        // 8. Habilita o botão de histórico
        lastHistoryData = mappedResults.payloadRequest;
        if (historyWrapper) historyWrapper.classList.remove('hidden');
        addHistoryBtn.classList.remove('hidden'); 
        
    } catch (error) {
        alert(`Erro ao calcular: ${error.message}`);
        
        // Limpa a tela de resultados no Frontend em caso de falha
        document.getElementById("res-bruto").textContent = 'R$ 0,00';
        document.getElementById("res-rendimento-bruto").textContent = 'R$ 0,00';
        document.getElementById("res-imposto").textContent = 'R$ 0,00';
        document.getElementById("res-liquido").textContent = 'R$ 0,00';
        document.getElementById("res-lucro-liquido").textContent = 'R$ 0,00';
        document.getElementById("res-percentual").textContent = '0,00%';

    } finally {
        calcularBtn.disabled = false;
        calcularBtn.textContent = 'Calcular';
    }
});

// === LISTENER: ADICIONAR AO HISTÓRICO (CHAMADA REAL) ===
if (addHistoryBtn) {
    addHistoryBtn.addEventListener('click', async () => {
        if (!lastHistoryData) {
            alert("Nenhum cálculo recente para salvar.");
            return;
        }

        addHistoryBtn.disabled = true;
        addHistoryBtn.textContent = 'Salvando...';

        try {
            await calculateInvestment(lastHistoryData, 'sim'); 
            
            alert('Simulação salva no Histórico com sucesso!');
            addHistoryBtn.classList.add('hidden'); 
            if (historyWrapper) historyWrapper.classList.add('hidden');

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
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Valor (R$)',
                            color: '#ccc'
                        },
                        ticks: {
                            color: '#ccc'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Período',
                            color: '#ccc'
                        },
                        ticks: {
                            color: '#ccc'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff' 
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += 'R$ ' + context.parsed.y.toFixed(2).replace('.', ',');
                                }
                                return label;
                            }
                        }
                    }
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