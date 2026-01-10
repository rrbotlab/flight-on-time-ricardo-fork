export default function CardVoo({ voo }) {
  return (
   <div className="
  bg-white
  rounded-xl
  shadow
  p-6
  border-l-4 border-sky-500
  w-full
  max-w-2xl
  mx-auto
">
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">
          {voo.origem} → {voo.destino}
        </span>
        <span className="text-sm text-gray-500">{voo.companhia}</span>
      </div>

      <div className="text-sm text-gray-600 mt-1">
        🕒 {voo.dataHora}
      </div>

      <div className="mt-3 flex justify-between">
        <span
          className={`px-3 py-1 rounded text-white text-sm ${
            voo.nivelRisco === "ALTO"
              ? "bg-red-500"
              : voo.nivelRisco === "MÉDIO"
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
        >
          {voo.previsao}
        </span>

        <span className="text-sm text-gray-700">
          {(voo.probabilidade * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
