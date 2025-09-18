# AS66A-Front-End-Certificadora-Especifica

# 📊 Calculadora de Investimentos de Renda Fixa

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

* **Página Inicial (Landing Page)**  
  Apresenta o projeto e direciona o usuário para a calculadora, com CTAs para iniciar a simulação.  

* **Página da Calculadora**  
  Formulário para entrada de dados (valor, prazo, taxas, etc.) e exibição detalhada dos resultados.  

* **Discriminação de Resultados**  
  Exibe Valor Bruto, Valor Líquido, Lucro Bruto e Custos Totais (IRRF, IOF e Taxa de Custódia).  

* **Exportação de Dados**  
  Permite exportar os resultados em formato CSV.  

* **Página de Comparação**  
  Analisa **lado a lado** diferentes cenários de investimento.  

---

## 🛠️ Tecnologias Utilizadas

* **HTML5** – Estruturação das páginas.  
* **CSS3** – Estilização e design responsivo.  
  * `global.css` → estilos globais  
  * `landing-page.css` → estilos da Landing Page  
  * `styles.css` → estilos da Calculadora  
* **JavaScript (ES6+)** – Lógica interativa e integração com o backend.  
  * `api.js` → comunicação com a API  
  * `main.js` → interações, formulários e resultados  

🔎 **Observação:** Os cálculos financeiros são processados no backend, garantindo precisão nas regras de juros, IRRF, IOF e taxas.

---

## 📂 Estrutura do Projeto

```bash
.
├── .gitignore
├── README.md
├── frontend/
│   ├── index.html          # Página principal (Landing Page)
│   ├── calculadora.html    # Página da Calculadora
│   ├── comparacao.html     # Página de Comparação
│   └── assets/
│       ├── css/
│       │   ├── global.css
│       │   ├── landing-page.css
│       │   └── styles.css
│       └── js/
│           ├── api.js
│           └── main.js
├── backend/                # Diretório do backend (quando aplicável)
└── .env                    # Variáveis de ambiente (backend)
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
