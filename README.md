# AS66A-Front-End-Certificadora-Especifica

Este repositório contém o código-fonte da aplicação de frontend para o projeto "Calculadora de Investimentos de Renda Fixa". A aplicação é desenvolvida em HTML, CSS e JavaScript puro para ser uma ferramenta web que simula o retorno de investimentos em Renda Fixa. 

Objetivo do Projeto

O objetivo principal é desenvolver uma 

aplicação web que sirva como ferramenta para simular o retorno de investimentos em Renda Fixa para pessoas físicas. 

A aplicação deve considerar o valor investido, o prazo, a taxa de juros, as regras de tributação (IOF e IRRF) e taxas adicionais para fornecer uma visão detalhada do retorno. 

Membros do Grupo

Matheus Faustino Meneguim: Responsável pela prototipagem, documentação, gestão do projeto, e suporte em UX/UI e frontend. 

André Faria de Souza: Responsável pelo desenvolvimento Backend. 

Maria Clara S Furini: Responsável por testes e desenvolvimento Frontend. 

Igor Batista Lima: Responsável pelo desenvolvimento Backend (Login/cadastro, roteamento, segurança, banco de dados). 

Eduardo Affonso Kasprovicz: Responsável pelo desenvolvimento Backend (Login/cadastro, roteamento, segurança, banco de dados). 

Sarah Kelly Almeida: Responsável pelo desenvolvimento Frontend. 

Calculadora de Investimentos de Renda Fixa
Este repositório contém o frontend de uma aplicação web estática (SPA), focada na simulação de investimentos. A interface é construída com tecnologias web fundamentais e se comunica com uma 


API RESTful para realizar os cálculos financeiros. 

Funcionalidades Principais (Frontend)

Página Inicial (Landing Page): Uma página de entrada que apresenta o projeto e direciona o usuário para a calculadora, com CTAs (Chamadas para Ação) para iniciar a simulação. 



Página da Calculadora: O ponto central da aplicação, com um formulário de entrada de dados (valor, prazo, taxas, etc.) e a exibição detalhada dos resultados. 




Discriminação de Resultados: Exibe o Valor Bruto, Valor Líquido, Lucro Bruto e Custos Totais, com detalhes de Imposto de Renda (IRRF), IOF e Taxa de Custódia. 


Exportação de Dados: Permite a exportação dos resultados da simulação em formato CSV. 


Página de Comparação: Uma ferramenta para análise lado a lado de diferentes cenários de investimento. 

Tecnologias Utilizadas
O frontend deste projeto é construído exclusivamente com as tecnologias fundamentais da web. A comunicação com o backend é feita através de requisições HTTP. 


HTML5: Estruturação das páginas e conteúdo.


CSS3: Estilização e design responsivo da interface. 


global.css: Estilos globais e reutilizáveis em todo o site.

landing-page.css: Estilos específicos da página inicial.

styles.css: Estilos para a página da calculadora.


JavaScript (ES6+): Lógica interativa do frontend e comunicação com o backend. 

api.js: Lida com as requisições para a API de cálculo.

main.js: Orquestra a interação do usuário, coleta de dados do formulário e atualização da interface.


Observação: A precisão dos cálculos financeiros é garantida pelo backend, que implementa a lógica complexa de juros, IRRF, IOF e outras taxas. 

Estrutura do Projeto
A organização dos arquivos segue uma estrutura clara para separar as responsabilidades do frontend e backend:

.
├── .gitignore
├── README.md
├── frontend/
│   ├── index.html                  # Página principal de entrada (Landing Page)
│   ├── calculadora.html            # Página da calculadora
│   ├── comparacao.html             # Página de comparação de cenários
│   └── assets/
│       ├── css/
│       │   ├── global.css          # Estilos globais (cores, fontes, etc.)
│       │   ├── landing-page.css    # Estilos específicos da Landing Page
│       │   └── styles.css          # Estilos da página da calculadora
│       └── js/
│           ├── api.js              # Lógica para a comunicação com a API
│           └── main.js             # Lógica interativa do frontend (formulário, resultados, etc.)
├── backend/                        # Diretório do backend (separado)
└── .env                            # Variáveis de ambiente
Como Abrir e Visualizar o Projeto
Como este é um projeto frontend estático, você pode visualizá-lo diretamente em um navegador web:

Baixe ou clone o repositório:

Bash

git clone [URL_DO_SEU_REPOSITORIO]
cd [nome-do-seu-repositorio]/frontend
Abra o arquivo index.html no seu navegador de preferência.

Você pode fazer isso clicando duas vezes no arquivo no seu explorador de arquivos, ou arrastando-o para a janela do navegador.

Link dos Requisitos: https://drive.google.com/drive/folders/1IoTTIXn4abjSkbZXwxjoaufsUYVyXZ-9?usp=sharing
