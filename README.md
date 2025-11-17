# AS66A-Front-End-Certificadora-Especifica

# 📊 Calculadora de Investimentos de Renda Fixa (InvestCalc)

Este repositório contém o **código-fonte da aplicação de frontend** do projeto **"Calculadora de Investimentos de Renda Fixa"**.  
A aplicação foi desenvolvida em **HTML, CSS e JavaScript puro** para simular o retorno de investimentos em renda fixa.

---

## 🎯 Objetivo do Projeto

O objetivo principal é desenvolver uma aplicação web que permita a **simulação do retorno de investimentos em Renda Fixa para pessoas físicas**.  

A aplicação considera:  
* Valor investido  
* Prazo  
* Taxa de juros  
* Regras de tributação (**IOF e IRRF**)  
* Taxas adicionais  

Com isso, fornece uma visão detalhada do retorno do investimento.

---

## 👨‍💻 Membros do Grupo

* **Matheus Faustino Meneguim** – Responsável pela prototipagem, documentação, gestão do projeto, ajudar no front-end, UX/UI. 
* **André Faria de Souza** – Responsável pelo desenvolvimento Front end e ajudar no backend. 
* **Maria Clara S. Furini** – Responsável pelos testes e desenvolvimento Front end. 
* **Igor Batista Lima** – Responsável pelo desenvolvimento Backend (Login/cadastro, roteamento, segurança, banco de dados). 
* **Eduardo Affonso Kasprovicz** –  Responsável pelo desenvolvimento Backend (Login/cadastro, roteamento, segurança, banco de dados). 
* **Sarah Kelly Almeida** – Responsável pelo desenvolvimento Front-end. 

---

## ⚙️ Funcionalidades (Frontend)

* **Página Inicial (Landing Page)** Apresenta o projeto e direciona o usuário para a calculadora, com CTAs para iniciar a simulação.

* **Dashboard de Simulação (Layout em Grid)** A página da calculadora exibe o **Formulário de Entrada** e a **Visualização de Resultados/Gráfico** lado a lado em telas maiores, otimizando a análise.

* **Gráfico de Evolução (Linha do Tempo)**
  Exibe um gráfico de linha interativo (usando **Chart.js**) que compara visualmente o **Patrimônio Total Acumulado** versus o **Capital Total Aportado** ao longo do tempo.

* **Controle Manual de Histórico**
  O salvamento de simulações no histórico é feito de forma manual pelo usuário, através de um botão "Adicionar ao Histórico", evitando registros automáticos indesejados.

* **Módulo de Histórico Detalhado** Permite a visualização, remoção e exportação de todas as simulações salvas, com detalhamento das colunas de **IR**, **IOF** e **Taxas**.

* **Discriminação de Resultados** Exibe Valor Bruto, Valor Líquido, Lucro Bruto e Custos Totais (IRRF, IOF e Taxa de Custódia).

* **Exportação de Dados** Permite exportar os resultados em formato CSV.

* **Página de Comparação** Analisa **lado a lado** diferentes cenários de investimento.

---

## 🛠️ Tecnologias e Frameworks Utilizados

* **HTML5** – Estruturação das páginas.
* **CSS3** – Estilização e design responsivo, utilizando Layout **Grid** para o Dashboard.
  * **Bootstrap 5** (Componentes e Utilitários CSS)
  * **Font Awesome** (Ícones)
* **JavaScript (ES6+)** – Lógica interativa, simulação e gerenciamento local de histórico.
  * **Chart.js** (Biblioteca) – Utilizada para gerar o gráfico de evolução do patrimônio.
  * **Axios** (Biblioteca) – Cliente HTTP para comunicação com o Backend (Autenticação).
  * **JavaScript Puro (Vanilla JS)** – Lógica principal de cálculo (`calculadora.js`) e manipulação do DOM.

🔎 **Observação:** Os cálculos financeiros de maior complexidade (juros, IRRF, IOF e taxas) são idealmente processados no backend, mas o frontend simula a lógica para demonstração.

---

## 📂 Estrutura do Projeto

```bash
.
├── .gitignore
├── README.md
├── (Páginas HTML - Raiz)
│   ├── index.html          # Página principal (Landing Page)
│   ├── calculadora.html    # Página da Calculadora (Dashboard)
│   ├── historico.html      # Página de Histórico de Simulações
│   ├── login.html          # Tela de Login/Cadastro
│   └── ... (termos.html, politica.html, etc.)
├── CSS/
│   ├── calculadora.css     # Estilos da Calculadora (Layout Grid, Cards)
│   ├── styles.css          # Estilos Globais e Landing Page
│   └── ... (login.css, faq.css, etc.)
└── JS/
    ├── calculadora.js      # Lógica da Calculadora (Cálculo, Gráfico, Histórico)
    ├── historico.js        # Lógica de renderização/remoção do Histórico
    ├── auth.js             # Lógica de autenticação do Header
    └── ... (login.js, export.js, etc.)
```
---
## 🚀 Como Executar o Projeto

1. Clone este repositório:
```
git clone [URL_DO_SEU_REPOSITORIO]
cd [nome-do-seu-repositorio]/frontend
```

2. Abra o arquivo index.html no navegador de sua preferência.

* Você pode clicar duas vezes no arquivo, ou

* arrastar o arquivo para a janela do navegador.
