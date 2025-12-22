# FlightOnTime - Motor de Inteligência Artificial

>> **Status:** 🚀 Em Produção (v4.2.0-SmartDistance) | **Recall de Segurança:** 90.7%

Este repositório contém o **Core de Data Science** do projeto FlightOnTime. Nossa missão é prever atrasos em voos comerciais no Brasil utilizando Machine Learning avançado enriquecido com dados meteorológicos, focando na segurança e planejamento do passageiro.

---

## A Evolução do Modelo (Do MVP ao Weather-Aware)

Nosso maior desafio foi lidar com o **desbalanceamento severo** dos dados (apenas 11% dos voos atrasam) e a complexidade de fatores externos.

Evoluímos de um modelo puramente histórico para uma arquitetura híbrida que considera as condições climáticas e utiliza tratamento nativo de categorias.

| Versão | Modelo | Tecnologia | Recall (Detecção) | Status |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | Random Forest | Bagging Ensemble | 87.0% | Descontinuado |
| v2.0 | XGBoost | Gradient Boosting | 87.2% | Testado |
| v3.0 | CatBoost | Histórico Puro | 89.4% | Legacy (MVP) |
| v4.0 | CatBoost + OpenMeteo | Weather-Aware Pipeline | 86.0% | Testado |
| v4.1 | CatBoost Native | Weather-Aware + Native Features | 90.8% | Estável |
| **v4.2** | **CatBoost + GeoMaps** | **Smart Distance Calculation** | **90.7%** | **Em Produção** |

*Nota: Com a implementação do CatBoost Native na v4.1, superamos a performance do modelo Legacy (v3.0), unindo a robustez climática com a precisão histórica.*

---

## Decisões Estratégicas de Negócio

### 1. Otimização do Limiar de Decisão (Threshold)

Realizamos uma análise matemática utilizando o **F2-Score** (que prioriza o Recall).

* **Sugestão do Algoritmo:** Corte em **0.43**.
* **Decisão de Negócio (Override):** Fixamos o corte em **0.35**.
* **Motivo:** Decidimos sacrificar precisão estatística para garantir a **Segurança**. Preferimos o risco de um "Falso Alerta Preventivo" do que deixar um passageiro perder o voo por não avisar sobre uma tempestade iminente.

### 2. Estratégia de Clima e Feriados (Pareto)

* **Feriados:** Aplicamos o calendário `holidays.Brazil()` apenas na data de partida, cobrindo 94% dos picos de demanda.
* **Clima:** Integramos variáveis de **Precipitação** e **Vento**. O modelo comprovou que condições adversas aumentam o risco de atraso em até **20 pontos percentuais**.

---

## Arquitetura e Engenharia de Features

O modelo v4.1 é um sistema híbrido que cruza histórico com condições físicas:

1. **Integração Meteorológica (NOVO):** Ingestão de dados de `precipitation` (mm) e `wind_speed` (km/h) para entender o impacto físico na aeronave.
2. **Detector de Feriados:** Cruzamento em tempo real da data do voo com o calendário oficial.
3. **Georreferenciamento:** Cálculo da distância geodésica (`distancia_km`) via Fórmula de Haversine.
4. **CatBoost Native Support:** Removemos encoders manuais e passamos a usar o tratamento nativo de categorias do algoritmo, aumentando a precisão em rotas complexas.
5.  **Smart Distance (v4.2):** O modelo agora "conhece" as coordenadas dos aeroportos. Se o usuário não informar a distância (`distancia_km`), o sistema calcula automaticamente a geodésica entre origem e destino.

### Stack Tecnológico

* **Linguagem:** Python 3.10+
* **ML Core:** CatBoost (Gradient Boosting)
* **External Data:** Open-Meteo API (Dados Climáticos)
* **API:** FastAPI + Uvicorn
* **Deploy:** Docker / Oracle Cloud Infrastructure (OCI)

---

## Regra de Negócio: O Semáforo de Risco

Traduzimos a probabilidade matemática em uma experiência visual para o usuário:

* **PONTUAL (Risco < 35%):**
    * Boas condições de voo e clima estável.
* **ALERTA PREVENTIVO (Risco 35% - 70%):**
    * O modelo detectou instabilidade (ex: chuva leve ou aeroporto congestionado). Monitore o painel.
* **ATRASO PROVÁVEL (Risco > 70%):**
    * Condições críticas detectadas (ex: Tempestade + Feriado). Alta chance de problemas.

---

## Instalação e Execução

### 1. Preparar o Ambiente
```bash
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt
```

### 2. Treinar o Modelo v4.1 (Opcional)

O repositório já inclui o arquivo `flight_classifier_v4.joblib` atualizado. Para retreinar:
```bash
python data-science/src/train.py
```

### 3. Subir a API

Inicie o servidor de predição localmente (a partir da raiz do projeto):
```bash
python -m uvicorn back-end.app:app --reload
```

Acesse a documentação automática em: http://127.0.0.1:8000/docs

---

## Documentação da API

A API aceita dados do voo e, opcionalmente, dados de clima.

### Endpoint: POST /predict

**Payload de Entrada (Exemplo Completo):**
```json
{
  "companhia": "GOL",
  "origem": "Congonhas",
  "destino": "Santos Dumont",
  "data_partida": "2025-11-20T08:00:00",
  "distancia_km": null,  // Opcional na v4.2 (Calculado automaticamente)
  "precipitation": 25.0,
  "wind_speed": 45.0
}
```

*Nota: Se `precipitation` ou `wind_speed` não forem enviados, a API assume 0 (Bom tempo). Se distancia_km for omitido, a API calcula automaticamente baseada nas coordenadas dos aeroportos. Se precipitation ou wind_speed não forem enviados, assume-se 0 (Bom tempo).*

**Resposta da API (Exemplo de Tempestade):**
```json
{
  "id_voo": "GOL-0800",
  "previsao_final": "ALTA PROBABILIDADE DE ATRASO",
  "probabilidade_atraso": 0.709,
  "cor": "red",
  "clima": "Chuva: 25.0mm",
  "metadados_modelo": {
    "versao": "4.2.0-SmartDistance",
    "threshold_aplicado": 0.35
  }
}
```

---

## Roadmap Estratégico (Fase 2)

Com a entrega da v4.1 (Native + Clima), o foco muda para dados de tráfego aéreo em tempo real.

### 1. Monitoramento de Malha Aérea (Efeito Dominó)

**O Desafio:** Atrasos na aviação funcionam em cascata. Um atraso em Brasília afeta Guarulhos horas depois.

**A Solução:** Integrar com APIs de tráfego (FlightRadar24) para calcular o "atraso médio do aeroporto" nos últimos 60 minutos.

**Novas Features Planejadas:**

* `fila_decolagem_atual`: Quantidade de aeronaves aguardando pista.
* `indice_atraso_aeroporto`: Média de atraso atual do hub.

---

## Dataset

**Fonte Oficial:** Flights in Brazil (2015-2017) - Kaggle

**Dados Climáticos:** Enriquecimento realizado via Open-Meteo Historical API.

**Como usar:**

1. Execute o Notebook `1_data_engineering_weather.ipynb` em `data-science/notebooks/` para gerar o dataset.
2. Execute o Notebook `2_modeling_strategy_v4.ipynb` para análise exploratória.