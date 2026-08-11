import os
import tensorflow as tf
import keras
from keras.models import Sequential
from keras.layers import Flatten, Dense

def train_and_save_model():
    os.makedirs("models", exist_ok=True)
    model_path = os.path.join("models", "digits_intel.h5")
    
    print("Loading MNIST dataset...")
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
    
    # Preprocessing identical to notebook and prompt specifications
    x_train = x_train / 255.0
    x_test = x_test / 255.0
    
    print("Building Sequential Keras model...")
    model = Sequential([
        Flatten(input_shape=(28, 28)),
        Dense(units=100, activation="relu"),
        Dense(units=30, activation="relu"),
        Dense(units=10, activation="softmax")
    ])
    
    print("Compiling model with RMSprop optimizer...")
    model.compile(
        optimizer="rmsprop",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    
    print("Training for 10 epochs...")
    model.fit(
        x=x_train,
        y=y_train,
        batch_size=32,
        epochs=10,
        validation_data=(x_test, y_test)
    )
    
    print(f"Saving trained model to '{model_path}'...")
    model.save(model_path)
    print("Model training & saving completed successfully!")

if __name__ == "__main__":
    train_and_save_model()
