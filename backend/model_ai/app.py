# app.py
import io
import base64
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import cv2
import os
from datetime import datetime
import json

from model import load_cnn_model, ga_denoise, retrain_model

app = Flask(__name__)
CORS(app)

# Load the trained model
try:
    cnn_model = load_cnn_model()
    print("✓ Model loaded successfully")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    cnn_model = None

# Create directories for feedback data
FEEDBACK_DIR = 'feedback_data'
LOGS_DIR = 'logs'

if not os.path.exists(FEEDBACK_DIR):
    os.makedirs(FEEDBACK_DIR)
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

def preprocess_image(file_storage):
    """
    Read bytes -> PIL -> 28x28 grayscale normalized
    """
    # Read bytes -> PIL
    image_bytes = file_storage.read()
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("L")  # grayscale

    # Resize to 28x28
    pil_img = pil_img.resize((28, 28))
    img = np.array(pil_img).astype("float32") / 255.0  # 0-1

    return img  # shape (28, 28)

def log_prediction(predicted_label, confidence, is_retry=False, retry_count=0):
    """
    Log predictions to file for monitoring
    """
    try:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        retry_text = f" (RETRY #{retry_count})" if is_retry else ""
        log_entry = f"{timestamp} - Predicted: {predicted_label}, Confidence: {confidence:.2f}%{retry_text}\n"
        
        log_file = os.path.join(LOGS_DIR, 'prediction_log.txt')
        with open(log_file, 'a') as f:
            f.write(log_entry)
    except Exception as e:
        print(f"Error logging prediction: {e}")

def log_feedback(correct_label, wrong_prediction, filename):
    """
    Log user feedback for analysis
    """
    try:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"{timestamp} - Wrong: {wrong_prediction}, Correct: {correct_label}, File: {filename}\n"
        
        log_file = os.path.join(LOGS_DIR, 'retrain_log.txt')
        with open(log_file, 'a') as f:
            f.write(log_entry)
    except Exception as e:
        print(f"Error logging feedback: {e}")

@app.route("/predict", methods=["POST"])
def predict():
    """
    Main prediction endpoint with retry support
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded (use form field 'file')"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if cnn_model is None:
        return jsonify({"error": "Model not loaded"}), 500

    # Check if this is a retry attempt
    is_retry = request.form.get('retry', 'false').lower() == 'true'
    retry_count = int(request.form.get('retry_count', 0))

    try:
        # 1) Preprocess to 28x28 grayscale
        img_28 = preprocess_image(file)

        # 2) GA denoising (with enhanced processing on retry)
        if is_retry and retry_count > 0:
            # Apply more aggressive denoising on retry
            denoised = ga_denoise(img_28, enhanced=True)
        else:
            denoised = ga_denoise(img_28)

        # 3) CNN prediction
        input_tensor = denoised.reshape(1, 28, 28, 1)  # batch, h, w, c
        probs = cnn_model.predict(input_tensor, verbose=0)[0]
        
        # On retry, consider second-best prediction if first retry failed
        sorted_indices = np.argsort(probs)[::-1]  # Sort in descending order
        
        if is_retry and retry_count >= 1 and len(sorted_indices) > 1:
            # Use second best prediction on second attempt
            predicted_label = int(sorted_indices[1])
            print(f"🔄 Retry #{retry_count}: Using alternate prediction {predicted_label}")
        else:
            predicted_label = int(np.argmax(probs))
        
        confidence = float(probs[predicted_label] * 100)
        
        # Convert probs to list for JSON serialization
        probs_list = [float(p) for p in probs]

        # Log the prediction
        log_prediction(predicted_label, confidence, is_retry, retry_count)

        # 4) Convert denoised image back to base64 PNG
        denoised_uint8 = (denoised * 255).astype("uint8")
        denoised_bgr = cv2.cvtColor(denoised_uint8, cv2.COLOR_GRAY2BGR)

        _, buffer = cv2.imencode(".png", denoised_bgr)
        cleaned_b64 = base64.b64encode(buffer).decode("utf-8")

        return jsonify({
            "label": predicted_label,
            "probs": probs_list,
            "cleaned_image": cleaned_b64,
            "retry_attempt": retry_count,
            "is_retry": is_retry
        })
    
    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/retrain", methods=["POST"])
def retrain():
    """
    Handle user feedback and retrain the model
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    correct_label = request.form.get('correct_label')
    wrong_prediction = request.form.get('wrong_prediction')

    if not correct_label:
        return jsonify({"error": "No correct label provided"}), 400

    try:
        correct_label = int(correct_label)
        
        if correct_label < 0 or correct_label > 9:
            return jsonify({"error": "Invalid label. Must be 0-9"}), 400

        # 1) Preprocess image
        img_28 = preprocess_image(file)

        # 2) Apply GA denoising
        denoised = ga_denoise(img_28)

        # 3) Save feedback data
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"feedback_{timestamp}_correct{correct_label}_wrong{wrong_prediction}.png"
        filepath = os.path.join(FEEDBACK_DIR, filename)
        
        # Save the denoised image
        denoised_uint8 = (denoised * 255).astype("uint8")
        cv2.imwrite(filepath, denoised_uint8)

        # Log the feedback
        log_feedback(correct_label, wrong_prediction, filename)

        # 4) Retrain the model with this correction
        input_tensor = denoised.reshape(1, 28, 28, 1)
        success = retrain_model(cnn_model, input_tensor, correct_label)

        if success:
            print(f"✅ Model retrained with correction: {wrong_prediction} -> {correct_label}")
            
            return jsonify({
                "success": True,
                "message": "Model updated with your feedback",
                "correct_label": correct_label,
                "wrong_prediction": wrong_prediction,
                "saved_file": filename
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to update model"
            }), 500

    except ValueError:
        return jsonify({"error": "Invalid label format"}), 400
    except Exception as e:
        print(f"Error in retraining: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/statistics", methods=["GET"])
def get_statistics():
    """
    Get model statistics and feedback data
    """
    try:
        # Count feedback files
        feedback_files = [f for f in os.listdir(FEEDBACK_DIR) if f.endswith('.png')]
        feedback_count = len(feedback_files)
        
        # Read prediction log
        prediction_log_file = os.path.join(LOGS_DIR, 'prediction_log.txt')
        total_predictions = 0
        if os.path.exists(prediction_log_file):
            with open(prediction_log_file, 'r') as f:
                total_predictions = len(f.readlines())
        
        # Read retrain log
        retrain_log_file = os.path.join(LOGS_DIR, 'retrain_log.txt')
        total_retrains = 0
        if os.path.exists(retrain_log_file):
            with open(retrain_log_file, 'r') as f:
                total_retrains = len(f.readlines())
        
        stats = {
            'total_predictions': total_predictions,
            'total_corrections': feedback_count,
            'total_retrains': total_retrains,
            'model_version': '1.0',
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'model_loaded': cnn_model is not None
        }
        
        return jsonify(stats)
    
    except Exception as e:
        print(f"Error getting statistics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/feedback_history", methods=["GET"])
def get_feedback_history():
    """
    Get recent feedback history
    """
    try:
        retrain_log_file = os.path.join(LOGS_DIR, 'retrain_log.txt')
        history = []
        
        if os.path.exists(retrain_log_file):
            with open(retrain_log_file, 'r') as f:
                lines = f.readlines()
                # Get last 10 entries
                for line in lines[-10:]:
                    history.append(line.strip())
        
        return jsonify({
            'history': history,
            'count': len(history)
        })
    
    except Exception as e:
        print(f"Error getting feedback history: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        "status": "healthy",
        "model_loaded": cnn_model is not None,
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Hybrid GA + CNN Digit Cleaner API",
        "status": "running",
        "model_loaded": cnn_model is not None,
        "endpoints": {
            "POST /predict": "Upload image for digit prediction",
            "POST /retrain": "Submit correction for model retraining",
            "GET /statistics": "Get model statistics",
            "GET /feedback_history": "Get recent feedback history",
            "GET /health": "Health check"
        }
    })

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 Starting Flask Backend Server...")
    print("   - Prediction endpoint: POST /predict")
    print("   - Retraining endpoint: POST /retrain")
    print("   - Statistics: GET /statistics")
    print("="*50)
    app.run(host="0.0.0.0", port=5000, debug=True)
