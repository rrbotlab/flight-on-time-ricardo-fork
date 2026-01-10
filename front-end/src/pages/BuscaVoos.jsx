import { api } from "../services/api";
import { isValidIATA } from "../utils/validators";
import { useState, useEffect } from "react";
import FlightCard from "../components/CardVoo";
import SkeletonCard from "../components/SkeletonCard";
import { getAeroportos } from "../services/aeroportos";
import { getCompanhias } from "../services/companhias";



export default function BuscaVoos() {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [companhia, setCompanhia] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [voos, setVoos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [mostrarCompanhia, setMostrarCompanhia] = useState(false);

  const [mostrarOrigem, setMostrarOrigem] = useState(false);
  const [mostrarDestino, setMostrarDestino] = useState(false);

  const [aeroportos, setAeroportos] = useState([]);
  const [companhias, setCompanhias] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [aeroportosData, companhiasData] = await Promise.all([
          getAeroportos(),
          getCompanhias()
        ]);
        setAeroportos(aeroportosData);
        setCompanhias(companhiasData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    carregarDados();
  }, []);

  async function buscarVoos() {
    setErro("");

    if (!isValidIATA(origem)) {
      setErro("Origem deve ser um código IATA válido (ex: GRU)");
      return;
    }

    if (!isValidIATA(destino)) {
      setErro("Destino deve ser um código IATA válido (ex: GIG)");
      return;
    }

    try {
      setLoading(true);
      setVoos([]);

      const response = await api.post("/predict", {
        companhia,
        origem,
        destino,
        data_partida: new Date(dataHora).toISOString(),
      });

      setVoos([
        {
          origem,
          destino,
          companhia,
          dataHora,
          previsao: response.data.previsao,
          probabilidade: response.data.probabilidade,
          nivelRisco: response.data.probabilidade > 0.6 ? "ALTO" : "BAIXO",
          cor: response.data.cor,
          detalhes: response.data.detalhes,
        },
      ]);
    } catch (error) {
      console.error(error);
      setErro("Erro ao consultar previsão do voo.");
    } finally {
      setLoading(false);
    }
  }

  function filtrarCompanhias(valor) {
  return companhias
    .filter((c) =>
      c.name.toLowerCase().includes(valor.toLowerCase())
    )
    .slice(0, 6);
}

  function filtrarAeroportos(valor) {
    return aeroportos
      .filter((a) =>
        `${a.iataCode} ${a.fullName}`
          .toLowerCase()
          .includes(valor.toLowerCase())
      )
      .slice(0, 6);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 text-center">
          ✈️ Consulta de voo
        </h2>

        {/* Companhia */}
        <div className="mb-4">
         <label className="block text-sm font-semibold mb-1">
       Companhia aérea
  </label>

  <div className="relative">
    <input
      className="w-full bg-gray-50 rounded-xl px-4 py-4 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Digite a companhia"
      value={companhia}
      onChange={(e) => {
        setCompanhia(e.target.value.toUpperCase());
        setMostrarCompanhia(true);
      }}
      onFocus={() => setMostrarCompanhia(true)}
      onBlur={() => setTimeout(() => setMostrarCompanhia(false), 150)}
    />

    {mostrarCompanhia && companhia.length >= 2 && (
      <ul className="absolute z-20 bg-white w-full mt-1 rounded-xl
                     shadow-lg max-h-52 overflow-y-auto border">
        {filtrarCompanhias(companhia).map((c) => (
          <li
            key={c.name}
            onMouseDown={() => {
              setCompanhia(c.name);
              setMostrarCompanhia(false);
            }}
            className="px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer"
          >
            {c.name}
          </li>
        ))}
      </ul>
    )}
  </div>
        </div>

        {/* Origem */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Origem</label>
          <div className="relative">
            <input
              className="w-full bg-gray-50 rounded-xl px-4 py-4 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o local ou aeroporto"
              value={origem}
              onChange={(e) => {
                setOrigem(e.target.value.toUpperCase());
                setMostrarOrigem(true);
              }}
              onFocus={() => setMostrarOrigem(true)}
              onBlur={() => setTimeout(() => setMostrarOrigem(false), 150)}
            />

            {mostrarOrigem && origem.length >= 2 && (
              <ul className="absolute z-20 bg-white w-full mt-1 rounded-xl
                             shadow-lg max-h-52 overflow-y-auto border">
                {filtrarAeroportos(origem).map((a) => (
                  <li
                    key={a.iataCode}
                    onMouseDown={() => {
                      setOrigem(a.iataCode);
                      setMostrarOrigem(false);
                    }}
                    className="px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="font-semibold">{a.fullName}</div>
                    <div className="text-xs text-gray-500">
                      {a.iataCode}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Destino */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Destino</label>
          <div className="relative">
            <input
              className="w-full bg-gray-50 rounded-xl px-4 py-4 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o local ou aeroporto"
              value={destino}
              onChange={(e) => {
                setDestino(e.target.value.toUpperCase());
                setMostrarDestino(true);
              }}
              onFocus={() => setMostrarDestino(true)}
              onBlur={() => setTimeout(() => setMostrarDestino(false), 150)}
            />

            {mostrarDestino && destino.length >= 2 && (
              <ul className="absolute z-20 bg-white w-full mt-1 rounded-xl
                             shadow-lg max-h-52 overflow-y-auto border">
                {filtrarAeroportos(destino).map((a) => (
                  <li
                    key={a.iataCode}
                    onMouseDown={() => {
                      setDestino(a.iataCode);
                      setMostrarDestino(false);
                    }}
                    className="px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="font-semibold">{a.fullName}</div>
                    <div className="text-xs text-gray-500">
                      {a.iataCode}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Data/Hora */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1">
            Data e hora
          </label>
          <input
            type="datetime-local"
            className="w-full bg-gray-50 rounded-xl px-4 py-4 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
          />
        </div>

        <button
          onClick={buscarVoos}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-semibold transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          {loading ? "Consultando..." : "Consultar voo"}
        </button>
      </div>

      {erro && (
        <p className="text-red-500 text-sm mt-3 text-center">{erro}</p>
      )}

    <div className="w-full max-w-5xl grid grid-cols-1">
        {loading &&
          Array.from({ length: 1 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}

        {!loading &&
          voos.map((voo, i) => <FlightCard key={i} voo={voo} />)}
      </div>
    </div>
  );
}
