# AS66A-Front-End-Certificadora-Especifica

📊 Calculadora de Investimentos de Renda Fixa

Este repositório contém o código-fonte da aplicação de frontend do projeto "Calculadora de Investimentos de Renda Fixa".
A aplicação foi desenvolvida em HTML, CSS e JavaScript puro para simular o retorno de investimentos em renda fixa.
---
🎯 Objetivo do Projeto

O objetivo principal é desenvolver uma aplicação web que permita a simulação do retorno de investimentos em Renda Fixa para pessoas físicas.

A aplicação considera:

Valor investido

Prazo

Taxa de juros

Regras de tributação (IOF e IRRF)

Taxas adicionais

Com isso, fornece uma visão detalhada do retorno do investimento.
---
👨‍💻 Membros do Grupo

Matheus Faustino Meneguim – Prototipagem, documentação, gestão do projeto, suporte em UX/UI e frontend.

André Faria de Souza – Desenvolvimento Backend.

Maria Clara S. Furini – Testes e desenvolvimento Frontend.

Igor Batista Lima – Desenvolvimento Backend (login/cadastro, roteamento, segurança, banco de dados).

Eduardo Affonso Kasprovicz – Desenvolvimento Backend (login/cadastro, roteamento, segurança, banco de dados).

Sarah Kelly Almeida – Desenvolvimento Frontend.

⚙️ Funcionalidades (Frontend)

Página Inicial (Landing Page)
Apresenta o projeto e direciona o usuário para a calculadora, com CTAs para iniciar a simulação.

Página da Calculadora
Formulário para entrada de dados (valor, prazo, taxas, etc.) e exibição detalhada dos resultados.

Discriminação de Resultados
Exibe Valor Bruto, Valor Líquido, Lucro Bruto e Custos Totais (IRRF, IOF e Taxa de Custódia).

Exportação de Dados
Permite exportar os resultados em formato CSV.

Página de Comparação
Analisa lado a lado diferentes cenários de investimento.

🛠️ Tecnologias Utilizadas

HTML5 – Estruturação das páginas.

CSS3 – Estilização e design responsivo.

global.css → estilos globais

landing-page.css → estilos da Landing Page

styles.css → estilos da Calculadora

JavaScript (ES6+) – Lógica interativa e integração com o backend.

api.js → comunicação com a API

main.js → interações, formulários e resultados

🔎 Observação: Os cálculos financeiros são processados no backend, garantindo precisão nas regras de juros, IRRF, IOF e taxas.
