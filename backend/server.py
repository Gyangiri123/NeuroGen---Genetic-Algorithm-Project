from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
from PIL import Image

# ensure relative paths inside `backend` resolve to files in this folder
os.chdir(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app)

try:
    from model_ai import model as model_module
except Exception:
    model_module = None

loaded_model = None

def load_model():
    global loaded_model
    if model_module is None:
        raise RuntimeError("`model_ai` package not found")
    loaded_model = model_module.load_cnn_model()


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    if loaded_model is None:
        return jsonify({"error": "model not loaded"}), 500

    if "file" not in request.files:
        return jsonify({"error": "no file uploaded (use form field 'file')"}), 400

    f = request.files["file"]
    try:
        img = Image.open(f.stream).convert("L").resize((28, 28))
    except Exception as e:
        return jsonify({"error": f"invalid image: {e}"}), 400

    arr = np.array(img).astype("float32") / 255.0
    arr = np.expand_dims(arr, axis=(0, -1))

    preds = loaded_model.predict(arr)
    label = int(np.argmax(preds[0]))
    probs = preds[0].tolist()
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import os
    import io
    import base64
    import numpy as np
    from PIL import Image

    # optional remote fetch
    import requests as _requests

    # ensure relative paths inside `backend` resolve to files in this folder
    os.chdir(os.path.dirname(__file__))

    app = Flask(__name__)
    CORS(app)

    try:
        from model_ai import model as model_module
    except Exception:
        model_module = None

    loaded_model = None

    def load_model():
        global loaded_model
        if model_module is None:
            raise RuntimeError("`model_ai` package not found")
        loaded_model = model_module.load_cnn_model()


    @app.route("/health")
    def health():
        return jsonify({"status": "ok"})


    def _image_from_bytes(bts):
        try:
            img = Image.open(io.BytesIO(bts)).convert("L").resize((28, 28))
            return img
        except Exception:
            return None


    def _get_image_from_request(req):
        # 1) multipart/form-data file upload field 'file'
        if "file" in req.files:
            f = req.files["file"]
            try:
                return Image.open(f.stream).convert("L").resize((28, 28))
            except Exception:
                return None

        # 2) query param or form/json field 'image' (base64 data or remote URL)
        val = None
        if req.args.get("image"):
            val = req.args.get("image")
        elif req.form.get("image"):
            val = req.form.get("image")
        elif req.is_json and req.get_json(silent=True) and req.get_json().get("image"):
            val = req.get_json().get("image")

        if val:
            val = val.strip()
            # data URI
            if val.startswith("data:"):
                try:
                    header, b64 = val.split(",", 1)
                    bts = base64.b64decode(b64)
                    return _image_from_bytes(bts)
                except Exception:
                    return None

            # remote URL
            if val.startswith("http://") or val.startswith("https://"):
                try:
                    r = _requests.get(val, timeout=5)
                    if r.status_code == 200:
                        return _image_from_bytes(r.content)
                    return None
                except Exception:
                    return None

            # plain base64
            try:
                bts = base64.b64decode(val)
                return _image_from_bytes(bts)
            except Exception:
                return None

        return None


    @app.route("/predict", methods=["POST"])
    def predict():
        if loaded_model is None:
            return jsonify({"error": "model not loaded"}), 500

        img = _get_image_from_request(request)
        if img is None:
            return jsonify({"error": "no valid image provided; send multipart 'file', query/form/json 'image' (base64 or URL)"}), 400

        arr = np.array(img).astype("float32") / 255.0
        arr = np.expand_dims(arr, axis=(0, -1))

        preds = loaded_model.predict(arr)
        label = int(np.argmax(preds[0]))
        probs = preds[0].tolist()
        return jsonify({"label": label, "probs": probs})


    if __name__ == "__main__":
        load_model()
        app.run(host="127.0.0.1", port=5000)
