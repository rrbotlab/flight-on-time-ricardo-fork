# data-science/src/train.py
import pandas as pd
import numpy as np
import joblib
import holidays
import os
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import recall_score

# --- CONFIGURAÇÃO ---
print(" Iniciando Treinamento V5 (Live Wheather)...")
current_dir = os.path.dirname(__file__)
data_path = os.path.join(current_dir, '../data/raw/BrFlights_Enriched_v4.csv')
model_path = os.path.join(current_dir, 'flight_classifier_v4.joblib')

if not os.path.exists(data_path):
    print(f" Erro: Dataset não encontrado em {data_path}")
    exit()
    
df = pd.read_csv(data_path, low_memory=False)

# --- 1. EXTRAÇÃO DE COORDENADAS (O SEGREDO) ---
print("  Mapeando coordenadas dos aeroportos...")
# Criamos um dicionário { 'GRU': {'lat': -23..., 'lon': -46...}, ... }
coords_dict = {}
# Agrupamos por origem para pegar lat/long únicas
aeroportos = df.groupby('Aeroporto.Origem')[['LatOrig', 'LongOrig']].first().reset_index()
for _, row in aeroportos.iterrows():
    coords_dict[row['Aeroporto.Origem']] = {
        'lat': row['LatOrig'],
        'long': row['LongOrig']
    }
# Fazemos o mesmo para destinos para garantir cobertura total
aeroportos_dest = df.groupby('Aeroporto.Destino')[['LatDest', 'LongDest']].first().reset_index()
for _, row in aeroportos_dest.iterrows():
    if row['Aeroporto.Destino'] not in coords_dict:
        coords_dict[row['Aeroporto.Destino']] = {
            'lat': row['LatDest'],
            'long': row['LongDest']
        }

# --- 2. PREPARAÇÃO (Igual à v4.1) ---
print("  Preparando dados...")
for col in ['precipitation', 'wind_speed']:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

# Haversine Distance (Usada para treino)
def haversine(lat1, lon1, lat2, lon2):
    r = 6371
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    a = np.sin(dphi/2)**2 + np.cos(phi1)*np.cos(phi2)*np.sin(dlambda/2)**2
    return r * 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))

df['distancia_km'] = haversine(df['LatOrig'], df['LongOrig'], df['LatDest'], df['LongDest'])

df['Partida.Prevista'] = pd.to_datetime(df['Partida.Prevista'])
df['Partida.Real'] = pd.to_datetime(df['Partida.Real'])
df = df.dropna(subset=['Partida.Real', 'Partida.Prevista'])

delay = (df['Partida.Real'] - df['Partida.Prevista']).dt.total_seconds() / 60
df['target'] = np.where(delay > 15, 1, 0)

br_holidays = holidays.Brazil()
df['is_holiday'] = df['Partida.Prevista'].dt.date.apply(lambda x: 1 if x in br_holidays else 0)
df['hora'] = df['Partida.Prevista'].dt.hour
df['dia_semana'] = df['Partida.Prevista'].dt.dayofweek
df['mes'] = df['Partida.Prevista'].dt.month
df['clima_imputado'] = df.get('clima_imputado', 0)

df.rename(columns={'Companhia.Aerea': 'companhia', 'Aeroporto.Origem': 'origem', 'Aeroporto.Destino': 'destino'}, inplace=True)

features = ['companhia', 'origem', 'destino', 'distancia_km', 'hora', 'dia_semana', 'mes', 'is_holiday', 'precipitation', 'wind_speed', 'clima_imputado']
cat_features = ['companhia', 'origem', 'destino']

for col in cat_features:
    df[col] = df[col].astype(str)

X = df[features]
y = df['target']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(" Treinando CatBoost...")
model_final = CatBoostClassifier(
    iterations=500, learning_rate=0.1, depth=6, auto_class_weights='Balanced',
    cat_features=cat_features, verbose=False, allow_writing_files=False
)
model_final.fit(X, y) # Treino Full para produção

# --- 3. EXPORTAÇÃO COM COORDENADAS ---
print(" Empacotando modelo e mapas...")
artifact = {
    'model': model_final,
    'features': features,
    'cat_features': cat_features,
    # AQUI ESTÁ A MÁGICA: Salvamos o dicionário de coordenadas junto com o modelo
    'airport_coords': coords_dict, 
    'metadata': {'versao': '5.0-LiveWeather', 'threshold': 0.35}
}

joblib.dump(artifact, model_path)
print(f"✅ Sucesso! Modelo inteligente salvo em: {model_path}")