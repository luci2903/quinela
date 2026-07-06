import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function PredictionPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPronosticos = async () => {
    try {
      const data = await api.getMyPredictions();
      console.log(data);
      setPredictions(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPronosticos();
  }, []);

  if (loading) {
    return <h2>Cargando pronósticos...</h2>;
  }

  return (
    <div className="page-container">
      <h1>Mis Pronósticos</h1>

      {predictions.length === 0 ? (
        <p>Aún no realizaste ningún pronóstico.</p>
      ) : (
        <div className="predictions-container">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="prediction-card">
              <h3>
                {prediction.match.homeTeam} vs {prediction.match.awayTeam}
              </h3>

              <p>
                <strong>Mi pronóstico:</strong>{" "}
                {prediction.homeScoreBet} - {prediction.awayScoreBet}
              </p>

              <p>
                <strong>Puntos:</strong> {prediction.points}
              </p>

              {prediction.match.status === "FINISHED" && (
                <p>
                  <strong>Resultado Final:</strong>{" "}
                  {prediction.match.homeScore} - {prediction.match.awayScore}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}