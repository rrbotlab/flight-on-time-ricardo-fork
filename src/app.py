import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os
import xgboost as xgb # Necesario para cargar el modelo

app = FastAPI(title="FlightOnTime DS API - V2 XGBoost")

# --- CARGA DEL MODELO Y ARTEFACTOS ---
current_dir = os.path.dirname(__file__)
model_path = os.path.join(current_dir, "flight_model_v2.joblib")

artifacts = None

try:
    artifacts = joblib.load(model_path)
    model = artifacts['model']
    encoders = artifacts['encoders']
    stats = artifacts['stats']
    threshold = artifacts.get('threshold', 0.5)
    print(f"✅ Modelo XGBoost V2 cargado. Threshold: {threshold}")
except Exception as e:
    print(f"⚠️ Error cargando modelo: {e}")

class FlightInput(BaseModel):
    companhia: str
    origem: str
    destino: str
    data_partida: str

def safe_encode(encoder, value):
    try:
        return int(encoder.transform([str(value)])[0])
    except:
        return 0 # Clase desconocida

@app.post("/predict")
def predict_flight(flight: FlightInput):
    if not artifacts:
        raise HTTPException(status_code=500, detail="Modelo no cargado")

    try:
        # 1. Ingeniería de Features (Replicar lo de train.py)
        dt = pd.to_datetime(flight.data_partida)
        
        hora = dt.hour
        dia_sem = dt.dayofweek
        mes = dt.month
        dia = dt.day

        # Variables calculadas
        es_fin_semana = 1 if dia_sem in [5, 6] else 0
        es_hora_pico = 1 if hora in [6,7,8,9,17,18,19,20] else 0
        temporada_alta = 1 if mes in [1,2,7,12] else 0
        fin_inicio_mes = 1 if (dia <= 5 or dia >= 26) else 0

        # Mapeo de Estadísticas Históricas (Lookup)
        # Si no tenemos datos de esa aerolínea/ruta, usamos 0
        avg_delay_cia = stats['companhia'].get(flight.companhia, 0)
        
        # Las claves del dict de rutas son tuplas (orig, dest)
        avg_delay_ruta = stats['ruta'].get((flight.origem, flight.destino), 0)
        
        rate_hora = stats['hora'].get(hora, 0)

        # 2. Encoding
        comp_enc = safe_encode(encoders['companhia'], flight.companhia)
        orig_enc = safe_encode(encoders['origem'], flight.origem)
        dest_enc = safe_encode(encoders['destino'], flight.destino)

        # 3. Crear DataFrame (EN EL MISMO ORDEN QUE EL ENTRENAMIENTO)
        features_dict = {
            'companhia_encoded': [comp_enc],
            'origem_encoded': [orig_enc],
            'destino_encoded': [dest_enc],
            'hora_partida': [hora],
            'dia_semana': [dia_sem],
            'mes': [mes],
            'es_fin_semana': [es_fin_semana],
            'es_hora_pico': [es_hora_pico],
            'temporada_alta': [temporada_alta],
            'fin_inicio_mes': [fin_inicio_mes],
            'airline_avg_delay': [avg_delay_cia],
            'route_avg_delay': [avg_delay_ruta],
            'hour_delay_rate': [rate_hora]
        }
        
        input_df = pd.DataFrame(features_dict)

        # 4. Predicción
        prob = float(model.predict_proba(input_df)[0][1])
        es_atrasado = bool(prob > threshold) # Usamos el threshold optimizado (0.53)

        return {
            "atrasado": es_atrasado,
            "probabilidade": round(prob, 4),
            "mensaje": "Predicción V2 (XGBoost)"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)