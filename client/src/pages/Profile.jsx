// Result.jsx
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { usePredictions } from "../context/PredictionContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from "recharts";

export default function Profile() {
  const { predictions, clearHistory } = usePredictions();
  const [filter, setFilter] = useState("all"); // all, correct, incorrect

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = predictions.length;
    const withTrueLabel = predictions.filter(p => p.trueLabel !== null);
    const correct = withTrueLabel.filter(p => p.label === p.trueLabel).length;
    const accuracy = withTrueLabel.length > 0 
      ? ((correct / withTrueLabel.length) * 100).toFixed(2) 
      : 0;
    const avgConfidence = total > 0
      ? (predictions.reduce((sum, p) => sum + parseFloat(p.confidence), 0) / total).toFixed(2)
      : 0;

    return { total, correct, accuracy, avgConfidence, withTrueLabel: withTrueLabel.length };
  }, [predictions]);

  // Prediction frequency data for chart
  const predictionFrequency = useMemo(() => {
    const freq = Array(10).fill(0);
    predictions.forEach(p => freq[p.label]++);
    return freq.map((count, digit) => ({ digit, count }));
  }, [predictions]);

  // Confidence distribution
  const confidenceDistribution = useMemo(() => {
    return predictions.map((p, i) => ({
      index: i + 1,
      confidence: parseFloat(p.confidence),
    }));
  }, [predictions]);

  // Filter predictions
  const filteredPredictions = useMemo(() => {
    if (filter === "all") return predictions;
    if (filter === "correct") return predictions.filter(p => p.label === p.trueLabel);
    if (filter === "incorrect") return predictions.filter(p => p.trueLabel !== null && p.label !== p.trueLabel);
    return predictions;
  }, [predictions, filter]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Heading */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-sky-400 mb-2">
            Results
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Model Performance on Noisy Digits
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl">
            The system provides real-time tracking of predictions made by the Hybrid GA + CNN model. Each uploaded image and its predicted digit are logged and monitored instantly. Analytics such as prediction confidence, accuracy trends, and error rates are visualized to help understand model performance. This real-time analysis helps in improving reliability and identifying areas for further optimization.
          </p>
        </motion.section>

        {/* Metrics cards */}
        <section className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            className="bg-slate-900/70 border border-slate-800 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xs text-slate-400 mb-1">Total Predictions</p>
            <p className="text-2xl font-semibold text-sky-400">{metrics.total}</p>
            <p className="text-xs text-slate-400 mt-1">
              Images processed so far.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-slate-900/70 border border-slate-800 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-slate-400 mb-1">Accuracy 
              <p> Number of Correct Predictions × 100 / Total Number of samples</p> 
              ​</p>
            <p className="text-2xl font-semibold text-emerald-400">{metrics.accuracy}%</p>
            <p className="text-xs text-slate-400 mt-1">
              Based on {metrics.withTrueLabel} labeled samples.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-slate-900/70 border border-slate-800 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-slate-400 mb-1">Avg Confidence</p>
            <p className="text-2xl font-semibold text-purple-400">{metrics.avgConfidence}%</p>
            <p className="text-xs text-slate-400 mt-1">
              Indicates the average confidence score assigned by the model to its predictions.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-slate-900/70 border border-slate-800 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs text-slate-400 mb-1">Observation</p>
            <p className="text-sm text-slate-300">
             The model gives higher confidence for well-centered and clearly written digits, while confidence drops for distorted or highly noisy images. This shows that the Hybrid GA + CNN model works best when key visual features are preserved after denoising.
            </p>
          </motion.div>
        </section>

        {/* Charts Section */}
        {predictions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Prediction Frequency Chart */}
            <motion.div
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-medium mb-4 text-purple-400">Prediction Frequency</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={predictionFrequency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="digit" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1e293b", 
                      border: "1px solid #475569",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Confidence Over Time Chart */}
            <motion.div
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-medium mb-4 text-sky-400">Confidence Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="index" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1e293b", 
                      border: "1px solid #475569",
                      borderRadius: "8px"
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        )}

        {/* Prediction History Table */}
        <motion.section 
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-medium">Prediction History</h2>
            <div className="flex gap-2 flex-wrap">
              {["all", "correct", "incorrect"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    filter === f
                      ? "bg-purple-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              {predictions.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Clear all prediction history?")) {
                      clearHistory();
                    }
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 rounded-lg text-sm transition"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm text-left">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Image</th>
                  <th className="py-2 pr-4">True Label</th>
                  <th className="py-2 pr-4">Predicted</th>
                  <th className="py-2 pr-4">Confidence</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {filteredPredictions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      {predictions.length === 0 
                        ? "No predictions yet. Upload images on the Home page!"
                        : "No predictions match the selected filter."}
                    </td>
                  </tr>
                ) : (
                  filteredPredictions.map((row, index) => (
                    <tr key={index} className="border-b border-slate-900/70 hover:bg-slate-800/30">
                      <td className="py-2 pr-4">{index + 1}</td>
                      <td className="py-2 pr-4">
                        {row.image && (
                          <img 
                            src={row.image} 
                            alt="digit" 
                            className="w-12 h-12 rounded border border-slate-600 object-cover" 
                          />
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {row.trueLabel !== null ? row.trueLabel : "—"}
                      </td>
                      <td className="py-2 pr-4 text-sky-400 font-semibold">{row.label}</td>
                      <td className="py-2 pr-4">{row.confidence}%</td>
                      <td className="py-2 pr-4">
                        {row.trueLabel === null ? (
                          <span className="text-slate-500">—</span>
                        ) : row.label === row.trueLabel ? (
                          <span className="text-emerald-400 font-semibold">✓ Correct</span>
                        ) : (
                          <span className="text-rose-400 font-semibold">✗ Incorrect</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {predictions.length === 0 && (
            <p className="text-xs text-slate-400 mt-3 text-center">
              Start uploading digit images on the Home page to see real-time results here!
            </p>
          )}
        </motion.section>
      </div>
    </main>
  );
}
