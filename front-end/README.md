# 🛫 FlightOnTime Frontend

🚀 **Flight On Time — Dashboard** é a interface frontend da aplicação que permite aos usuários consultar previsões de atraso de voos com base em origem, destino, companhia e data/hora.

Este projeto foi desenvolvido com **React + Vite + Tailwind CSS** e se comunica com a API backend para prever atrasos. A interface é responsiva, interativa e conta com **autocomplete para aeroportos e companhias aéreas**, além de validações de IATA.

---

## 📌 Funcionalidades

✨ Interface amigável para consulta de voos  
✈️ Autocomplete de aeroportos e companhias aéreas  
🕒 Campo de data e hora para consulta precisa  
📊 Exibição de cards com resultado de previsão  
🎨 Estilo moderno com Tailwind  
⚡ Skeleton loading enquanto carrega resultados  
📍 Validação de códigos IATA (ex: GRU, GIG)

---

## 📁 Tecnologias

✔ React  
✔ Vite  
✔ Tailwind CSS  
✔ Axios (para consumo da API backend)  
✔ Validações customizadas (IATA)  
✔ Componentização de interfaces

---

## 🚀 Pré-requisitos

Antes de começar, você precisa ter instalado:

✔ Node.js (recomendado v16+)  
✔ NPM ou Yarn

---

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/natashaalmeida/flightontime-frontend.git

2.# 🛫 FlightOnTime Frontend

🚀 **Flight On Time — Dashboard** é a interface frontend da aplicação que permite aos usuários consultar previsões de atraso de voos com base em origem, destino, companhia e data/hora.

Este projeto foi desenvolvido com **React + Vite + Tailwind CSS** e se comunica com a API backend para prever atrasos. A interface é responsiva, interativa e conta com **autocomplete para aeroportos e companhias aéreas**, além de validações de IATA.

---

## 📌 Funcionalidades

✨ Interface amigável para consulta de voos  
✈️ Autocomplete de aeroportos e companhias aéreas  
🕒 Campo de data e hora para consulta precisa  
📊 Exibição de cards com resultado de previsão  
🎨 Estilo moderno com Tailwind  
⚡ Skeleton loading enquanto carrega resultados  
📍 Validação de códigos IATA (ex: GRU, GIG)

---

## 📁 Tecnologias

✔ React  
✔ Vite  
✔ Tailwind CSS  
✔ Axios (para consumo da API backend)  
✔ Validações customizadas (IATA)  
✔ Componentização de interfaces

---

## 🚀 Pré-requisitos

Antes de começar, você precisa ter instalado:

✔ Node.js (recomendado v16+)  
✔ NPM ou Yarn

---

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/natashaalmeida/flightontime-frontend.git

2. Acesse a pasta do projeto:

cd flightontime-frontend

3.Instale as dependências:
npm install

4. Inicie as aplicações
npm run dev

A aplicaçõ irá abrir automaticamnete no navegador em:
http://localhost:5173

flightontime-frontend/
├─ public/
├─ src/
│  ├─ components/        # Componentes reutilizáveis (CardVoo, SkeletonCard, etc.)
│  ├─ data/              # Dados estáticos (aeroportos, companhias)
│  ├─ pages/             # Páginas principais (BuscaVoos, Dashboard, etc.)
│  ├─ services/          # Configuração de cliente Axios
│  ├─ utils/             # Validações, helpers, utilitários
│  ├─ App.jsx            # Ponto de entrada das rotas/UI
│  └─ index.css          # Estilos globais
├─ package.json
├─ tailwind.config.js
├─ vite.config.js
└─ README.md

📲 Uso

1. Preencha os campos:
✔ Companhia aérea
✔ Origem (código IATA ou aeroporto)
✔ Destino (código IATA ou aeroporto)
✔ Data e hora do voo
2. Clique em “Consultar voo”.
3.Veja o card de resultado com previsão e probabilidade de atraso.

🧠 Observações

🟡 A interface está preparada para receber dados de uma API real.
🔧 Caso queira conectar ao seu backend, ajuste a baseURL do Axios em src/services/api.js





