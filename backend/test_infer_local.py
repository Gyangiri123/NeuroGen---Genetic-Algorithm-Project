import os
os.chdir(os.path.dirname(__file__))
from model_ai import model
import numpy as np
from PIL import Image

img_path = 'mnist_noisy/test/9/img_00496.png'
img = Image.open(img_path).convert('L').resize((28, 28))
arr = np.array(img).astype('float32') / 255.0
arr = np.expand_dims(arr, axis=(0, -1))

m = model.load_cnn_model()
preds = m.predict(arr)
print('pred shape:', preds.shape)
print('pred label:', int(np.argmax(preds[0])))
print('probs:', preds[0].tolist())
