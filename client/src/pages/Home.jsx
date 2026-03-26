// Home.jsx
import React, { useState } from "react";
import { usePredictions } from "../context/PredictionContext";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";


export default function Home() {
  const [prediction, setPrediction] = useState({
    label: "-",
    confidence: 0,
    probs: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cleanedImage, setCleanedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // NEW: Feedback system states
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctLabel, setCorrectLabel] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showRetrain, setShowRetrain] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  const { addPrediction, predictions } = usePredictions();


  // Calculate metrics
  const metrics = {
    total: predictions.length,
    accuracy: predictions.length > 0
      ? ((predictions.filter(p => p.label === p.trueLabel).length / predictions.filter(p => p.trueLabel !== null).length) * 100 || 0).toFixed(0)
      : 0,
    avgConfidence: predictions.length > 0
      ? (predictions.reduce((sum, p) => sum + parseFloat(p.confidence), 0) / predictions.length).toFixed(0)
      : 0,
  };


  // Drag & Drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file, false);
    }
  };


  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // NEW: Reset feedback state
  const resetFeedbackState = () => {
    setShowFeedback(false);
    setIsCorrect(null);
    setCorrectLabel('');
    setRetryCount(0);
    setFeedbackMessage('');
    setShowRetrain(false);
  };


  // File upload handler - MODIFIED to support retry
  const handleFileUpload = async (file, isRetry = false) => {
    setLoading(true);
    setError("");
    setProcessingStep(0);
    
    // Save file for retry/retrain
    if (!isRetry) {
      setCurrentFile(file);
      resetFeedbackState();
    }
    
    // Create preview
    if (!isRetry) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }

    // NEW: Show retry message
    if (isRetry) {
      setFeedbackMessage('🔍 Okay, I will check again...');
    }


    try {
      // Step 1: Preprocessing
      setProcessingStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));


      const formData = new FormData();
      formData.append("file", file);

      // NEW: Add retry information
      if (isRetry) {
        formData.append("retry", "true");
        formData.append("retry_count", retryCount.toString());
      }


      // Step 2: GA Processing
      setProcessingStep(2);
      
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });


      if (!response.ok) {
        throw new Error("Backend connection failed");
      }


      const data = await response.json();


      if (data.error) {
        throw new Error(data.error);
      }


      // Step 3: CNN Classification
      setProcessingStep(3);
      await new Promise(resolve => setTimeout(resolve, 300));


      const predictedLabel = data.label;
      const confidenceValue = (Math.max(...data.probs) * 100).toFixed(2);


      setPrediction({
        label: predictedLabel,
        confidence: confidenceValue,
        probs: data.probs,
      });


      if (data.cleaned_image) {
        setCleanedImage(`data:image/png;base64,${data.cleaned_image}`);
      }


      // Show confetti only on first prediction
      if (!isRetry) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // NEW: Show feedback UI instead of prompt
      setShowFeedback(true);
      setFeedbackMessage('');
      
      if (isRetry) {
        setRetryCount(retryCount + 1);
      }


    } catch (err) {
      setError(err.message || "Error connecting to backend");
      console.error("Full error:", err);
    } finally {
      setLoading(false);
      setProcessingStep(0);
    }
  };

  // NEW: Handle user feedback (correct/wrong)
  const handleFeedback = (correct) => {
    setIsCorrect(correct);
    
    if (correct) {
      setFeedbackMessage('✅ Great! Thank you for confirming.');
      setShowConfetti(true);
      
      // Save to predictions context
      addPrediction({
        label: prediction.label,
        confidence: prediction.confidence,
        trueLabel: prediction.label,
        probs: prediction.probs,
        image: preview,
        timestamp: Date.now(),
      });
      
      setTimeout(() => {
        resetFeedbackState();
      }, 2000);
    } else {
      // Wrong prediction
      if (retryCount < 1) {
        // First retry
        setTimeout(() => {
          handleFileUpload(currentFile, true);
        }, 500);
      } else {
        // Second wrong - ask for correction
        setShowRetrain(true);
        setFeedbackMessage('😔 I apologize for the incorrect prediction. Please help me learn by providing the correct digit.');
      }
    }
  };

  // NEW: Handle retraining submission
  const handleRetrainSubmit = async () => {
    if (!correctLabel || correctLabel < 0 || correctLabel > 9) {
      setError('Please enter a valid digit (0-9)');
      return;
    }

    setLoading(true);
    setFeedbackMessage('📚 Learning from your feedback...');

    try {
      const formData = new FormData();
      formData.append('file', currentFile);
      formData.append('correct_label', correctLabel);
      formData.append('wrong_prediction', prediction.label);

      const response = await fetch('http://localhost:5000/retrain', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFeedbackMessage('✅ Thank you! I have learned from this correction and will make better predictions in the future.');
        setShowConfetti(true);
        
        // Save to predictions with correct label
        addPrediction({
          label: prediction.label,
          confidence: prediction.confidence,
          trueLabel: parseInt(correctLabel),
          probs: prediction.probs,
          image: preview,
          timestamp: Date.now(),
          retrained: true,
        });
        
        setTimeout(() => {
          resetFeedbackState();
          setPrediction({ label: "-", confidence: 0, probs: null });
          setCleanedImage(null);
          setPreview(null);
        }, 3000);
      } else {
        setError('Error during retraining. Please try again.');
      }
    } catch (err) {
      setError('Error connecting to server for retraining.');
      console.error('Retraining error:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, false);
  };


  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Page heading */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">
            Hybrid Genetic Algorithm + CNN Digit Cleaner
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl">
          A noisy handwritten digit image is uploaded as input to the system. The Genetic Algorithm is used to denoise and optimize the image by reducing noise and enhancing relevant features. The processed image is then passed to a Convolutional Neural Network (CNN) for classification. Finally, the CNN predicts the handwritten digit with high accuracy, even in the presence of noise, demonstrating the effectiveness of the hybrid approach.
          </p>
        </motion.section>


        {/* Quick Stats */}
        {predictions.length > 0 && (
          <motion.div 
            className="grid grid-cols-3 gap-3 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-sky-400">{metrics.total}</p>
              <p className="text-xs text-slate-500">Processed</p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{metrics.accuracy}%</p>
              <p className="text-xs text-slate-500">Accuracy</p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{metrics.avgConfidence}%</p>
              <p className="text-xs text-slate-500">Avg Conf.</p>
            </div>
          </motion.div>
        )}


        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* NEW: Feedback Message */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-blue-500/10 border border-blue-400/50 rounded-xl text-blue-300 text-sm text-center"
            >
              {feedbackMessage}
            </motion.div>
          )}
        </AnimatePresence>


        {/* Main 2-column layout */}
        <section className="grid md:grid-cols-2 gap-6 items-start">
          {/* Upload card */}
          <motion.div 
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg shadow-sky-900/20 backdrop-blur"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-lg font-medium mb-3">Input Image</h2>


            <label
              htmlFor="digit-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-sky-500 transition-colors rounded-xl py-10 px-4 cursor-pointer bg-slate-900/60"
            >
              <div className="mb-3 flex flex-col items-center">
                {preview && !loading ? (
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 object-contain rounded-lg border border-slate-600 mb-3"
                  />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 text-xl">
                    {loading ? "⏳" : "⬆"}
                  </span>
                )}
                <p className="mt-3 text-sm font-medium text-slate-100">
                  {loading ? "Processing..." : preview ? "Click to upload another" : "Drag & drop your digit image here"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  or click to browse from your device
                </p>
              </div>
              <input
                id="digit-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
            </label>


            {/* Processing Steps */}
            {loading && (
              <motion.div 
                className="mt-4 bg-slate-800/50 rounded-lg p-4 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className={`flex items-center gap-2 ${processingStep >= 1 ? 'text-sky-400' : 'text-slate-600'}`}>
                  <div className={processingStep === 1 ? "animate-spin h-4 w-4 border-2 border-sky-400 border-t-transparent rounded-full" : "h-4 w-4 rounded-full bg-sky-400"} />
                  <span className="text-sm">Step 1: Preprocessing image</span>
                </div>
                <div className={`flex items-center gap-2 ${processingStep >= 2 ? 'text-purple-400' : 'text-slate-600'}`}>
                                    <div className={processingStep === 2 ? "animate-pulse h-4 w-4 bg-purple-400 rounded-full" : "h-4 w-4 rounded-full bg-slate-600"} />
                  <span className="text-sm">Step 2: Genetic Algorithm denoising</span>
                </div>
                <div className={`flex items-center gap-2 ${processingStep >= 3 ? 'text-cyan-400' : 'text-slate-600'}`}>
                  <div className={processingStep === 3 ? "animate-bounce h-4 w-4 bg-cyan-400 rounded-full" : "h-4 w-4 rounded-full bg-slate-600"} />
                  <span className="text-sm">Step 3: CNN classification</span>
                </div>
              </motion.div>
            )}


            <p className="mt-4 text-xs text-slate-400">
              Tip: Use a clear, centered digit on a plain background for best results.
            </p>


            {/* Recent Predictions Mini */}
            {predictions.length > 0 && !loading && (
              <motion.div 
                className="mt-6 bg-slate-900/50 border border-slate-800 rounded-xl p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-sm font-medium mb-3 text-slate-400">Recent Predictions</h3>
                <div className="flex gap-3">
                  {predictions.slice(-3).reverse().map((p, i) => (
                    <div key={i} className="flex-1 bg-slate-800/50 rounded-lg p-2 text-center">
                      <img src={p.image} alt="digit" className="w-12 h-12 mx-auto rounded mb-1 object-contain" />
                      <p className="text-lg font-bold text-sky-400">{p.label}</p>
                      <p className="text-xs text-slate-500">{p.confidence}%</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>


          {/* Results card */}
          <motion.div 
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg shadow-sky-900/20 backdrop-blur"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-lg font-medium mb-4">Model Output</h2>


            {/* Predicted digit */}
            <div className="flex items-center gap-4 mb-5">
              <motion.div 
                className="h-14 w-14 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center text-2xl font-bold"
                animate={prediction.label !== "-" ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {prediction.label}
              </motion.div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Predicted Digit
                </p>
                <p className="text-sm text-slate-200">
                  CNN classifier output
                </p>
              </div>
            </div>


            {/* Main Confidence bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Confidence</span>
                <span>{prediction.confidence}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.confidence}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>


            {/* All Predictions Chart */}
            {prediction.probs && (
              <motion.div 
                className="mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-sm font-medium mb-2 text-slate-400">All Digit Probabilities</h3>
                <div className="space-y-1">
                  {[0,1,2,3,4,5,6,7,8,9].map((digit) => {
                    const prob = (prediction.probs[digit] * 100).toFixed(1);
                    const isTop = digit == prediction.label;
                    return (
                      <div key={digit} className="flex items-center gap-2">
                        <span className={`text-xs w-4 font-medium ${isTop ? 'text-sky-400' : 'text-slate-400'}`}>
                          {digit}
                        </span>
                        <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${
                              isTop 
                                ? 'bg-gradient-to-r from-sky-400 to-purple-500' 
                                : 'bg-slate-600'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${prob}%` }}
                            transition={{ duration: 0.5, delay: digit * 0.05 }}
                          />
                        </div>
                        <span className={`text-xs w-10 text-right ${isTop ? 'text-sky-400 font-medium' : 'text-slate-500'}`}>
                          {prob}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}


            {/* Before/After Comparison */}
            {preview && cleanedImage && (
              <motion.div 
                className="mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-sm font-medium mb-2 text-slate-400">Before vs After (GA Denoising)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Original</p>
                    <img 
                      src={preview} 
                      alt="Original" 
                      className="w-full h-24 object-contain rounded border border-slate-700 bg-slate-900" 
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Cleaned (GA)</p>
                    <img 
                      src={cleanedImage} 
                      alt="Cleaned" 
                      className="w-full h-24 object-contain rounded border border-sky-500 bg-slate-900" 
                    />
                  </div>
                </div>
              </motion.div>
            )}


            {/* Cleaned image placeholder (when no prediction yet) */}
            {!cleanedImage && (
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                  Cleaned Image (GA output)
                </p>
                <div className="h-32 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-center text-xs text-slate-500">
                  Denoised digit preview will appear here.
                </div>
              </div>
            )}


            <p className="text-xs text-slate-400 mb-5">
              The Genetic Algorithm removes noise or optimizes features, and the
              Convolutional Neural Network classifies the cleaned digit.
            </p>

            {/* NEW: Feedback Buttons */}
            <AnimatePresence>
              {showFeedback && !showRetrain && isCorrect === null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-purple-500/30"
                >
                  <p className="text-center text-sm mb-3 text-purple-300 font-medium">
                    Is this prediction correct?
                  </p>
                  <div className="flex justify-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFeedback(true)}
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      ✅ Yes, Correct
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFeedback(false)}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      ❌ No, Wrong
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* NEW: Retrain Form */}
            <AnimatePresence>
              {showRetrain && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-5 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-xl border border-cyan-500/30"
                >
                  <h3 className="text-base font-semibold text-cyan-400 mb-3 text-center">
                    🎓 Help Me Learn
                  </h3>
                  <p className="text-slate-300 mb-4 text-center text-sm">
                    What is the correct digit in the image?
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="9"
                      value={correctLabel}
                      onChange={(e) => setCorrectLabel(e.target.value)}
                      placeholder="Enter digit (0-9)"
                      className="w-32 p-3 text-center text-xl font-bold rounded-lg bg-slate-900 text-white border border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      disabled={loading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRetrainSubmit}
                      disabled={loading || !correctLabel}
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? '⏳ Training...' : '📚 Submit & Train Model'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
