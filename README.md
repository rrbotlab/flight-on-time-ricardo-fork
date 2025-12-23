#  FlightOnTime - Motor de Inteligência Artificial

> **Status:**  Em Produção (v5.0.0-LiveWeather) | **Recall de Segurança:** 90.8%

Este repositório contém o **Core de Data Science** do projeto FlightOnTime. Nossa missão é prever atrasos em voos comerciais no Brasil utilizando Machine Learning avançado enriquecido com dados meteorológicos em tempo real, focando na segurança e planejamento do passageiro.

---

##  A Evolução do Modelo (Do MVP ao Live-Weather)

Nosso maior desafio foi lidar com o **desbalanceamento severo** dos dados (apenas 11% dos voos atrasam) e a complexidade de fatores externos.

Evoluímos de um modelo puramente histórico para uma arquitetura autônoma que consulta APIs de clima em tempo real.

| Versão | Modelo | Tecnologia | Recall (Detecção) | Status |
|:-------|:-------|:-----------|:------------------|:-------|
| v1.0 | Random Forest | Bagging Ensemble | 87.0% | Descontinuado |
| v2.0 | XGBoost | Gradient Boosting | 87.2% | Testado |
| v3.0 | CatBoost | Histórico Puro | 89.4% | Legacy (MVP) |
| v4.0 | CatBoost + OpenMeteo | Weather-Aware Pipeline | 86.0% | Testado |
| v4.1 | CatBoost Native | Weather-Aware + Native Features | 90.8% | Estável |
| v4.2 | CatBoost + GeoMaps | Smart Distance Calculation | 90.7% | Estável |
| **v5.0** | **CatBoost + Live API** | **Real-Time Weather Integration** | **90.7%** | **Em Produção** |

*Nota: Com a implementação do CatBoost Native e integração Live, superamos a performance dos modelos anteriores, unindo precisão histórica com dados do mundo real.*

---

##  Decisões Estratégicas de Negócio

### 1. Otimização do Limiar de Decisão (Threshold)

Realizamos uma análise matemática utilizando o **F2-Score** (que prioriza o Recall).

- **Sugestão do Algoritmo:** Corte em **0.43**.
- **Decisão de Negócio (Override):** Fixamos o corte em **0.35**.
- **Motivo:** Decidimos sacrificar precisão estatística para garantir a **Segurança**. Preferimos o risco de um "Falso Alerta Preventivo" do que deixar um passageiro perder o voo por não avisar sobre uma tempestade iminente.

### 2. Estratégia de Clima e Feriados (Pareto)

- **Feriados:** Aplicamos o calendário `holidays.Brazil()` apenas na data de partida, cobrindo 94% dos picos de demanda.
- **Clima:** O modelo consulta a API da **OpenMeteo** em tempo real. Condições adversas (chuva > 10mm, vento > 30km/h) aumentam drasticamente o risco calculado.

---

##  Arquitetura e Engenharia de Features

O modelo v5.0 é um sistema autônomo que cruza histórico com dados vivos:

1. **Integração Meteorológica (NOVO):** Ingestão de dados de `precipitation` (mm) e `wind_speed` (km/h) para entender o impacto físico na aeronave.
2. **Detector de Feriados:** Cruzamento em tempo real da data do voo com o calendário oficial.
3. **Georreferenciamento:** Cálculo da distância geodésica (`distancia_km`) via Fórmula de Haversine.
4. **CatBoost Native Support:** Tratamento nativo de categorias, aumentando a precisão em rotas complexas.
5. **Smart Distance (v4.2):** O modelo "conhece" as coordenadas dos aeroportos e calcula a distância automaticamente.
6. **Live Weather Integration (v5.0):** Conexão em tempo real com a API `OpenMeteo`. Se o usuário não fornecer dados climáticos, o sistema busca automaticamente a previsão do tempo para a hora e local do voo.

### Stack Tecnológico

- **Linguagem:** Python 3.10+
- **ML Core:** CatBoost (Gradient Boosting)
- **External Data:** Open-Meteo API (Dados Climáticos)
- **API:** FastAPI + Uvicorn
- **Dependência:** Biblioteca `requests` para chamadas HTTP.
- **Deploy:** Docker / Oracle Cloud Infrastructure (OCI)

---

##  Regra de Negócio: O Semáforo de Risco

Traduzimos a probabilidade matemática em uma experiência visual para o usuário:

- 🟢 **PONTUAL (Risco < 35%):**
  - Boas condições de voo e clima estável.
- 🟡 **ALERTA PREVENTIVO (Risco 35% - 70%):**
  - O modelo detectou instabilidade (ex: chuva leve ou aeroporto congestionado). Monitore o painel.
- 🔴 **ATRASO PROVÁVEL (Risco > 70%):**
  - Condições críticas detectadas (ex: Tempestade + Feriado). Alta chance de problemas.

---

##  Instalação e Execução

### 1. Preparar o Ambiente
```bash
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt
```

### 2. Treinar o Modelo v5.0 (Opcional)

O repositório já inclui o arquivo `flight_classifier_v4.joblib` atualizado com o mapa de coordenadas. Para retreinar:
```bash
python data-science/src/train.py
```

### 3. Subir a API

Inicie o servidor de predição localmente (a partir da raiz do projeto):
```bash
python -m uvicorn data-science.src.app:app --reload
```

Acesse a documentação automática em: http://127.0.0.1:8000/docs

---

##  Documentação da API

A API aceita dados do voo e busca automaticamente o clima se necessário.

**Endpoint:** `POST /predict`

**Payload de Entrada (Minimalista - v5.0):** Agora o sistema é autônomo. Basta informar o voo e a data.
```json
{
  "companhia": "GOL",
  "origem": "Congonhas",
  "destino": "Santos Dumont",
  "data_partida": "2025-12-24T14:00:00"
}
```

*Nota: `distancia_km`, `precipitation` e `wind_speed` são opcionais. Se omitidos, a API calcula a distância geodésica e busca o clima em tempo real via OpenMeteo.*

**Resposta da API (Exemplo com Clima Automático):**
```json
{
  "previsao": "🟡 ALERTA",
  "probabilidade": 0.654,
  "cor": "yellow",
  "dados_utilizados": {
    "distancia": 366.0,
    "chuva": 5.2,
    "vento": 12.0,
    "fonte_clima": "✅ LIVE (OpenMeteo)"
  }
}
```

---

##  Roadmap Estratégico (Fase 3)

Com a entrega da v5.0 (Live Weather), o sistema está completo em termos de previsão física. O próximo passo é o tráfego aéreo.

### 1. Monitoramento de Malha Aérea (Efeito Dominó)

**O Desafio:** Atrasos na aviação funcionam em cascata. Um atraso em Brasília afeta Guarulhos horas depois.

**A Solução:** Integrar com APIs de tráfego (FlightRadar24) para calcular o "atraso médio do aeroporto" nos últimos 60 minutos.

**Novas Features Planejadas:**

- `fila_decolagem_atual`: Quantidade de aeronaves aguardando pista.
- `indice_atraso_aeroporto`: Média de atraso atual do hub.

---

##  Dataset

**Fonte Oficial:** Flights in Brazil (2015-2017) - Kaggle  
**Dados Climáticos:** Enriquecimento realizado via Open-Meteo Historical API.

**Como usar:**

1. Execute o Notebook `1_data_engineering_weather.ipynb` em `data-science/notebooks/` para gerar o dataset.
2. Execute o Notebook `2_modeling_strategy_v4.ipynb` para análise exploratória.