import sys

from model_ai import model


def main():
    try:
        m = model.build_cnn_model()
        m.summary()
        print("Model built successfully")
    except Exception as e:
        print("ERROR building model:", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
