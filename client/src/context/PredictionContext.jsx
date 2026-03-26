// src/context/PredictionContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const PredictionContext = createContext();

export function usePredictions() {
  return useContext(PredictionContext);
}

export function PredictionProvider({ children }) {
  const [predictions, setPredictions] = useState(() => {
    // Load from localStorage on initial load
    const saved = localStorage.getItem("predictions");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever predictions change
  useEffect(() => {
    localStorage.setItem("predictions", JSON.stringify(predictions));
  }, [predictions]);

  const addPrediction = (predictionData) => {
    setPredictions((prev) => [
      ...prev,
      {
        ...predictionData,
        timestamp: Date.now(),
      },
    ]);
  };

  const clearHistory = () => {
    setPredictions([]);
    localStorage.removeItem("predictions");
  };

  return (
    <PredictionContext.Provider value={{ predictions, addPrediction, clearHistory }}>
      {children}
    </PredictionContext.Provider>
  );
}
