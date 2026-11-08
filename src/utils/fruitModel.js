
import * as tf from "@tensorflow/tfjs";

const MODEL_URL = "/models/fruit_tfjs_model/model.json";

let model = null;

export async function loadFruitModel() {
  if (model) return model;

  await tf.ready();

  model = await tf.loadGraphModel(MODEL_URL);

  console.log("Fruit Quality CNN Model Loaded");
  console.log("Model outputs:", model.outputNodes);

  return model;
}

export async function predictFruit(imageElement) {
  const loadedModel = await loadFruitModel();

  const input = tf.tidy(() => {
    return tf.browser
      .fromPixels(imageElement, 3)
      .resizeBilinear([224, 224])
      .toFloat()
      .expandDims(0);
  });

  let output;

  try {
    output = await loadedModel.executeAsync(input);

    let predictionTensor;

    if (output instanceof tf.Tensor) {
      predictionTensor = output;
    } else if (Array.isArray(output)) {
      predictionTensor = output[0];
    } else {
      predictionTensor = Object.values(output)[0];
    }

    const values = await predictionTensor.data();

    const freshProbability = Math.max(
      0,
      Math.min(1, Number(values[0]))
    );

    const rottenProbability = 1 - freshProbability;

    return {
      className:
        freshProbability >= 0.5 ? "Fresh" : "Rotten",

      freshProbability,
      rottenProbability,

      confidence:
        Math.max(freshProbability, rottenProbability)
    };

  } finally {
    input.dispose();

    if (output instanceof tf.Tensor) {
      output.dispose();
    } else if (Array.isArray(output)) {
      output.forEach(tensor => tensor.dispose());
    } else if (output) {
      Object.values(output).forEach(tensor => tensor.dispose());
    }
  }
}
