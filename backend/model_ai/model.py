# model.py
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.datasets import mnist
from tensorflow.keras.utils import to_categorical
import cv2


MODEL_PATH = "saved_cnn.h5"


def build_cnn_model():
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation="relu", input_shape=(28, 28, 1)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation="relu"),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(64, activation="relu"),
        layers.Dense(10, activation="softmax"),
    ])
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def train_and_save_model():
    # Load MNIST
    (x_train, y_train), (x_test, y_test) = mnist.load_data()
    x_train = x_train.astype("float32") / 255.0
    x_test = x_test.astype("float32") / 255.0


    x_train = np.expand_dims(x_train, -1)
    x_test = np.expand_dims(x_test, -1)


    y_train = to_categorical(y_train, 10)
    y_test = to_categorical(y_test, 10)


    model = build_cnn_model()
    model.fit(
        x_train, y_train,
        epochs=5,
        batch_size=128,
        validation_split=0.1,
        verbose=1,
    )


    test_loss, test_acc = model.evaluate(x_test, y_test, verbose=0)
    print("Test accuracy:", test_acc)


    model.save(MODEL_PATH)
    print("Model saved at", MODEL_PATH)


def load_cnn_model():
    return tf.keras.models.load_model(MODEL_PATH)


# ---------------------------
# Simple GA-style denoising
# ---------------------------


def ga_denoise(image_28x28):
    """
    image_28x28: np.array shape (28,28) normalized 0-1.
    Very simple 'GA-like' approach:
      - generate several candidate denoised images
      - pick the one with highest 'smoothness' (less noise).
    """


    def mutation(img):
        # simple mutation = apply slight Gaussian blur
        return cv2.GaussianBlur(img, (3, 3), 0)


    def fitness(img):
        # higher fitness = smoother (less gradient magnitude)
        gx = cv2.Sobel(img, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(img, cv2.CV_32F, 0, 1, ksize=3)
        grad_mag = np.sqrt(gx ** 2 + gy ** 2)
        return -np.mean(grad_mag)  # smoother -> more negative grads


    population_size = 6
    generations = 3


    # initial population = copies + slight blur
    population = []
    for _ in range(population_size):
        candidate = mutation(image_28x28)
        population.append(candidate)


    best = image_28x28
    best_fit = fitness(best)


    for _ in range(generations):
        # evaluate fitness
        fits = [fitness(ind) for ind in population]


        # pick best 2 as "parents"
        parents_idx = np.argsort(fits)[-2:]
        parents = [population[i] for i in parents_idx]


        # update global best
        for ind, f in zip(population, fits):
            if f > best_fit:
                best_fit = f
                best = ind


        # create new population via mutation of parents
        new_pop = []
        for p in parents:
            for _ in range(population_size // 2):
                child = mutation(p)
                new_pop.append(child)
        population = new_pop


    denoised = np.clip(best, 0.0, 1.0)
    return denoised


# ============================================================================
# NEW FUNCTIONS - Added for feedback and retraining feature
# ============================================================================

def ga_denoise_enhanced(image_28x28):
    """
    Enhanced version of GA denoising for retry attempts.
    Uses more aggressive parameters for better noise removal.
    
    Args:
        image_28x28: np.array shape (28,28) normalized 0-1
    
    Returns:
        denoised image
    """
    def mutation(img):
        # More aggressive blur for retry
        return cv2.GaussianBlur(img, (5, 5), 0)

    def fitness(img):
        gx = cv2.Sobel(img, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(img, cv2.CV_32F, 0, 1, ksize=3)
        grad_mag = np.sqrt(gx ** 2 + gy ** 2)
        return -np.mean(grad_mag)

    # Enhanced parameters
    population_size = 10
    generations = 5

    population = []
    for _ in range(population_size):
        candidate = mutation(image_28x28)
        population.append(candidate)

    best = image_28x28
    best_fit = fitness(best)

    for _ in range(generations):
        fits = [fitness(ind) for ind in population]
        parents_idx = np.argsort(fits)[-2:]
        parents = [population[i] for i in parents_idx]

        for ind, f in zip(population, fits):
            if f > best_fit:
                best_fit = f
                best = ind

        new_pop = []
        for p in parents:
            for _ in range(population_size // 2):
                child = mutation(p)
                new_pop.append(child)
        population = new_pop

    denoised = np.clip(best, 0.0, 1.0)
    return denoised


def retrain_model(model, input_tensor, correct_label, epochs=5):
    """
    Retrain the model with user-provided correct label.
    This enables the model to learn from mistakes.
    
    Args:
        model: The loaded CNN model
        input_tensor: Shape (1, 28, 28, 1) - preprocessed image
        correct_label: int (0-9) - the correct digit
        epochs: Number of training iterations
    
    Returns:
        bool: True if retraining successful, False otherwise
    """
    try:
        # Create one-hot encoded label
        label = np.zeros((1, 10))
        label[0, correct_label] = 1
        
        # Reduce learning rate for fine-tuning
        current_lr = float(tf.keras.backend.get_value(model.optimizer.learning_rate))
        reduced_lr = current_lr * 0.1
        tf.keras.backend.set_value(model.optimizer.learning_rate, reduced_lr)
        
        print(f"Retraining model with correct label: {correct_label}")
        
        # Train on the corrected example
        model.fit(
            input_tensor,
            label,
            epochs=epochs,
            batch_size=1,
            verbose=0
        )
        
        # Restore learning rate
        tf.keras.backend.set_value(model.optimizer.learning_rate, current_lr)
        
        # Save updated model
        model.save(MODEL_PATH)
        print("Model retrained and saved successfully!")
        
        return True
        
    except Exception as e:
        print(f"Error during retraining: {e}")
        return False


if __name__ == "__main__":
    train_and_save_model()
