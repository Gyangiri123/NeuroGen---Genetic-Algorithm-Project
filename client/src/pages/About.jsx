// About.jsx
import React from "react";

export default function About() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Heading */}
        <section className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-400 mb-2">
            About The Project
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Hybrid Genetic Algorithm + CNN for Noisy Digit Recognition
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl">
           This project focuses on recognizing handwritten digits from noisy images by combining a Genetic Algorithm (GA) with a Convolutional Neural Network (CNN). The Genetic Algorithm is used to optimize and denoise the input image by reducing noise and enhancing important features. The optimized image is then passed to the CNN for accurate classification. This hybrid approach improves recognition performance compared to traditional methods, especially in noisy environments. The system is designed to be efficient, adaptive, and suitable for real-world handwritten digit recognition applications..
          </p>
        </section>

        {/* Problem + approach */}
        <section className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-lg font-medium mb-2">Problem Statement</h2>
            <p className="text-sm text-slate-300">
              In traditional computer vision pipelines, noise and poor-quality
              data often hinder performance. Our project mitigates this by
              applying a genetic search mechanism that evolves over time to find
              optimal feature points and representations.
            </p>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-lg font-medium mb-2">Proposed Hybrid Approach</h2>
            <p className="text-sm text-slate-300">
              A Genetic Algorithm is used to reduce noise or optimize features,
              while a CNN performs deep feature extraction and final digit
              classification, even when images are distorted or unclear.
            </p>
          </div>
        </section>

        {/* Flow cards */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-3">Working Pipeline</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Step 1
              </p>
              <h3 className="text-sm font-semibold mb-1">Noisy Input Digit</h3>
              <p className="text-xs text-slate-300">
                The user uploads a noisy handwritten digit image, similar to noisy MNIST samples. The system accepts images with different noise levels, making it suitable for real-world handwritten data where distortions and imperfections are common.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Step 2
              </p>
              <h3 className="text-sm font-semibold mb-1">Genetic Algorithm</h3>
              <p className="text-xs text-slate-300">
                The Genetic Algorithm (GA) evolves candidate solutions to reduce noise and refine important feature points in the image. Through selection, crossover, and mutation, it produces a cleaner and more optimized representation for accurate classification.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Step 3
              </p>
              <h3 className="text-sm font-semibold mb-1">CNN Classification</h3>
              <p className="text-xs text-slate-300">
               The Convolutional Neural Network (CNN) processes the cleaned image and extracts high-level features. Based on these features, it predicts the final digit label with high confidence and accuracy.
              </p>
            </div>
          </div>
        </section>

        {/* Applications + dataset */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-lg font-medium mb-2">Applications</h2>
            <p className="text-sm text-slate-300">
             The hybrid architecture can be applied to domains such as autonomous navigation, surveillance systems, and medical diagnostics, where high accuracy and robustness to noise are critical. By effectively handling distorted or noisy inputs, the system ensures reliable performance in real-world and safety-critical applications.
            </p>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-lg font-medium mb-2">Dataset & Results</h2>
            <p className="text-sm text-slate-300">
             The model is evaluated on noisy MNIST digit datasets and demonstrates improved performance compared to conventional models that rely solely on CNNs without Genetic Algorithm optimization. This evaluation highlights the effectiveness of the GA–CNN hybrid approach in handling noisy data.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
