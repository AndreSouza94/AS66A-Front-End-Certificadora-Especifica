import { API_URL_AUTH, setAuthToken } from './auth.js'; 

// Variável global para armazenar a instância do gráfico
let chartInstance = null;
let lastHistoryData = null; // Armazena o payload da última simulação


const taxas = {
  selic: 15.00,
  cdi: 14.90,
  ipca: 5.17,
  poupança: 8.37 // Taxa usada para a linha de comparação
};

// =======================================================
// FUNÇÃO AUXILIAR: CÁLCULO DA SÉRIE DA POUPANÇA (LOCAL)
// =======================================================

function calculateSavingsSeries(initialValue, monthlyAporte, months) {
    const taxaAnualPoupança = taxas.poupança / 100;
    // Fator mensal de capitalização
    const fatorMensalPoupança = Math.pow(1 + taxaAnualPoupança, 1/12); 

    let saldo = initialValue;
    let totalAportadoAtual = initialValue;
    // Ponto Inicial (Mês 0)
    const series = [{ periodo: 0, saldo: initialValue, aportado: initialValue }];
    
    for (let i = 1; i <= months; i++) {
        // Aplica a capitalização ao saldo existente
        saldo *= fatorMensalPoupança;
        
        // Adiciona o novo aporte
        saldo += monthlyAporte;
        totalAportadoAtual += monthlyAporte;

        series.push({
            periodo: i,
            saldo: saldo,
            aportado: totalAportadoAtual
        });
    }
    return series;
}


// =======================================================
// INICIALIZAÇÃO E CHECK DE AUTENTICAÇÃO (Robusta)
// =======================================================
(function() {
    const token = localStorage.getItem('token');
    
    const isNotAuthenticated = !token || (typeof token === 'string' && token.trim() === ''); 

    if (isNotAuthenticated) { 
        alert('Você precisa estar logado para acessar a calculadora. Redirecionando para a tela de Login.');
        window.location.href = 'login.html'; 
    } else {
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
        inputAporteMensal.value = '0'; 
    } else {
        grupoAporte.classList.add('hidden');
        inputAporteMensal.disabled = true;
        inputAporteMensal.value = '0'; 
    }
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
   
    const valorInicial = parseFloat(document.getElementById("valor").value) || 0;
    const dataInicialStr = document.getElementById("data-inicial").value;
    const dataFinalStr = document.getElementById("data-final").value;
    
    const rentabilidade = parseFloat(document.getElementById("rentabilidade").value) || 0;
    
    let aporte = 0;
    if (document.getElementById("check-aporte").checked) {
        
        aporte = parseFloat(document.getElementById("aporte-mensal").value) || 0;
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
        const vInicial = parseFloat(resultados.valorInicial || 0);
        const rendimentoB = parseFloat(resultados.rendimentoBruto || 0);
        const tempoDias = parseFloat(resultados.tempoDias || 0);
        const meses = Math.floor(tempoDias / 30); // Número de meses para o gráfico/aporte


        const impostosTotais = parseFloat(resultados.impostoRenda || 0) + parseFloat(resultados.impostoIOF || 0);
        const valorFinalLiquido = parseFloat(resultados.lucroLiquido || 0);
        const totalAportado = parseFloat(resultados.totalCapitalAportado || vInicial);
        const lucroLiquidoReal = valorFinalLiquido - totalAportado; 

        const mappedResults = {
            valorFinalBruto: valorFinalLiquido + impostosTotais, 
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
        
        // 7. Renderiza o Gráfico com todas as séries
        const seriesData = {
            investment: {
                monthlySeries: resultados.monthlySeries && resultados.monthlySeries.length > 2 ? resultados.monthlySeries : null,
                vInicial: vInicial,
                vFinal: valorFinalLiquido,
                totalAportado: totalAportado,
                tempoDias: tempoDias
            },
            savings: calculateSavingsSeries(vInicial, aporte, meses) // Calculada localmente
        };

        renderChart(seriesData); 
        
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


function renderChart(fullSeriesData) {
    const chartContainer = document.querySelector('#chart-section .form-container');
    const chartSection = document.getElementById("chart-section");
    
    if (typeof Chart === 'undefined') {
        chartSection.classList.remove('hidden');
        chartContainer.innerHTML = '<p class="text-center" style="color: #ccc; padding: 20px;">ERRO: Biblioteca Chart.js não carregada.</p>';
        return; 
    }
    
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    // 1. Determina a série de investimento a ser usada
    let investmentSeries = fullSeriesData.investment.monthlySeries;
    let totalAportadoFinal = fullSeriesData.investment.totalAportado;
    let finalValue = fullSeriesData.investment.vFinal;
    let initialValue = fullSeriesData.investment.vInicial;
    let tempoDias = fullSeriesData.investment.tempoDias;

    // Se o Backend não retornar a série mensal, cria a série simples de 2 pontos
    if (!investmentSeries || investmentSeries.length <= 2) {
         investmentSeries = [
            { periodo: 0, saldo: initialValue, aportado: initialValue },
            { periodo: Math.floor(tempoDias / 30), saldo: finalValue, aportado: totalAportadoFinal }
         ];
    }
    
    const savingsSeries = fullSeriesData.savings;

    chartContainer.innerHTML = '<canvas id="patrimonio-chart"></canvas>';
    const chartCanvas = document.getElementById('patrimonio-chart');
    
    try {
        // Labels do Eixo X: Mês 0, Mês 1, etc.
        const labels = investmentSeries.map(d => {
            if (d.periodo === 0) return 'Início';
            if (d.periodo === Math.floor(tempoDias / 30)) return 'Fim';
            return `Mês ${d.periodo}`;
        });

        // Data Points
        const patrimonio = investmentSeries.map(d => d.saldo);
        const aportado = investmentSeries.map(d => d.aportado);
        const poupança = savingsSeries.map(d => d.saldo);
        
        const textColor = '#1d1d1f'; // Cor do texto do Chart.js (baseado no CSS)

        const datasets = [
            // 1. MEU PATRIMÔNIO 
            {
                label: 'Meu Patrimônio',
                data: patrimonio,
                borderColor: '#143158', 
                backgroundColor: 'rgba(20, 49, 88, 0.1)',
                fill: false,
                tension: 0.3,
                borderWidth: 3,
                pointRadius: 3 
            }, 
            // 2. POUPANÇA (Comparativo - Cor Laranja/Destaque)
            {
                label: `Poupança (${taxas.poupança.toFixed(2)}% a.a.)`,
                data: poupança,
                borderColor: '#ff8c32', 
                backgroundColor: 'rgba(255, 140, 50, 0.1)',
                fill: false,
                tension: 0.3,
                borderWidth: 3,
                pointRadius: 3
            },
            // 3. CAPITAL APORTADO (Cor Cinza, pontilhado)
            {
                label: 'Capital Aportado',
                data: aportado,
                borderColor: '#5a6170', // Muted color
                backgroundColor: 'transparent',
                fill: false,
                borderDash: [5, 5],
                tension: 0.0,
                pointRadius: 0
            }
        ];

        
        chartInstance = new Chart(chartCanvas, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index', 
                    intersect: false,
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Valor (R$)', color: textColor },
                        ticks: {
                            color: textColor,
                            callback: function(value) { return 'R$ ' + value.toLocaleString('pt-BR'); }
                        },
                        grid: { color: 'rgba(15, 31, 61, 0.05)' }
                    },
                    x: {
                        // FORÇA A ESCALA A SER CATEGORICAL para exibir rótulos de mês
                        type: 'category', 
                        title: { display: true, text: 'Período', color: textColor },
                        
                        // CORREÇÃO: Usando o callback para mostrar rótulos espaçados (Mês 6, Mês 12, etc.)
                        ticks: {
                            color: textColor,
                            callback: function(index, value) {
                                // Exibe apenas a cada 6 meses, além de Início e Fim.
                                const totalPoints = labels.length;
                                const isStartOrEnd = index === 0 || index === totalPoints - 1;
                                // Checa se o mês é múltiplo de 6, e ignora Início/Fim
                                const isMultipleOfSix = (index % 6 === 0) && (index !== 0) && (index !== totalPoints - 1);

                                if (isStartOrEnd || isMultipleOfSix) {
                                    return labels[index];
                                }
                                return ''; 
                            },
                            maxRotation: 45, 
                            minRotation: 45
                        },
                        grid: { color: 'rgba(15, 31, 61, 0.05)' }
                    }
                },
                plugins: {
                    legend: { labels: { color: textColor } },
                    tooltip: {
                        enabled: true,
                        usePointStyle: true, 
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#ff8c32',

                        callbacks: {
                            // Título do Tooltip (Mês X)
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            // Rótulo da linha (Ex: Meu Patrimônio: R$ 6.742,54)
                            label: function(context) {
                                let label = context.dataset.label || '';
                                const value = context.parsed.y;
                                
                                if (label) {
                                    return `${label}: R$ ${value.toFixed(2).replace('.', ',')}`;
                                }
                                return null;
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
        chartContainer.innerHTML = '<p class="text-center" style="color: var(--text); padding: 20px;">Houve um erro interno ao gerar o gráfico. Verifique o console para detalhes.</p>';
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