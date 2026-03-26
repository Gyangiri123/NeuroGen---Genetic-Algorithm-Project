"""
Generate a noisy MNIST dataset and save images into mnist_noisy/train/<label>/ and mnist_noisy/test/<label>/.

Usage (from project root):
python -m mnist_noisy.generate_noisy_mnist --noise 0.3 --max-train 60000 --max-test 10000

Defaults will write all MNIST images. You can limit with --max-train/--max-test.
"""
import os
import argparse
import numpy as np
import cv2
from tensorflow.keras.datasets import mnist


def add_noise(img, noise_level=0.3):
    # img expected 0-255 uint8
    sigma = noise_level * 255.0
    noise = np.random.normal(0, sigma, img.shape).astype(np.float32)
    noisy = img.astype(np.float32) + noise
    noisy = np.clip(noisy, 0, 255).astype(np.uint8)
    return noisy


def save_dataset(x, y, out_dir, noise_level=0.3, max_images=None):
    os.makedirs(out_dir, exist_ok=True)
    n = len(x)
    if max_images is not None:
        n = min(n, max_images)
    counts = {}
    for i in range(n):
        label = int(y[i])
        label_dir = os.path.join(out_dir, str(label))
        os.makedirs(label_dir, exist_ok=True)
        img = x[i]
        if img.ndim == 2:
            img_u8 = (img * 255).astype(np.uint8) if img.max() <= 1.0 else img.astype(np.uint8)
        else:
            img_u8 = img.astype(np.uint8)
        noisy = add_noise(img_u8, noise_level=noise_level)
        fname = f"img_{i:05d}.png"
        path = os.path.join(label_dir, fname)
        cv2.imwrite(path, noisy)
        counts[label] = counts.get(label, 0) + 1
    return counts


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--noise", type=float, default=0.3, help="Noise level (0-1)")
    parser.add_argument("--max-train", type=int, default=None, help="Max train images to generate")
    parser.add_argument("--max-test", type=int, default=None, help="Max test images to generate")
    args = parser.parse_args()

    (x_train, y_train), (x_test, y_test) = mnist.load_data()
    # scale to 0-255 uint8 if needed
    if x_train.dtype != np.uint8:
        x_train = (x_train.astype(np.float32) / x_train.max() * 255.0).astype(np.uint8)
        x_test = (x_test.astype(np.float32) / x_test.max() * 255.0).astype(np.uint8)

    root = os.path.dirname(__file__)
    train_out = os.path.join(root, "train")
    test_out = os.path.join(root, "test")

    print(f"Generating noisy MNIST with noise={args.noise}")
    print("Saving to:", train_out, test_out)

    train_counts = save_dataset(x_train, y_train, train_out, noise_level=args.noise, max_images=args.max_train)
    test_counts = save_dataset(x_test, y_test, test_out, noise_level=args.noise, max_images=args.max_test)

    print("Train counts per label:", train_counts)
    print("Test counts per label:", test_counts)


if __name__ == "__main__":
    main()
