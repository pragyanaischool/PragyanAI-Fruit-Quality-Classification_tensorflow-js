import { useEffect, useState } from "react";
import "./App.css";
import { predictFruit } from "./utils/fruitModel";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handleClassify = async () => {
    if (!preview) {
      setError("Please upload a fruit image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const image = new Image();
      image.src = preview;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("Unable to load image."));
      });

      const prediction = await predictFruit(image);
      setResult(prediction);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Prediction failed. Please check the model files."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview("");
    setResult(null);
    setError("");

    const input = document.getElementById("fruit-upload");
    if (input) input.value = "";
  };

  const freshPercentage = result
    ? (result.freshProbability * 100).toFixed(2)
    : "0.00";

  const rottenPercentage = result
    ? (result.rottenProbability * 100).toFixed(2)
    : "0.00";

  return (
    <div className="app">
      <header className="top-header">
        <div className="header-inner">
          <img
            src="/pragyanai-logo.png"
            alt="PragyanAI - Grow with Gyan"
            className="brand-logo"
          />

          <div className="header-right">
            <span className="header-tag">AI-POWERED APPLICATION</span>
            <span className="model-tag">CNN | TensorFlow.js</span>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-label">PRAGYANAI AI LABS</span>

            <h1>
              PragyanAI <span>Image Classification</span>
            </h1>

            <h2>Fruit Quality Detection</h2>

            <p>
              Intelligent fruit freshness detection using Deep Learning.
              Upload an image and let AI classify it as Fresh or Rotten.
            </p>

            <div className="hero-points">
              <span>✓ AI-Powered Analysis</span>
              <span>✓ Real-Time Prediction</span>
              <span>✓ Freshness Classification</span>
            </div>
          </div>
        </section>

        <section className="workspace">
          <div className="workspace-heading">
            <div>
              <span className="section-label">IMAGE ANALYSIS</span>
              <h2>Analyse Your Fruit</h2>
              <p>Upload a fruit image to check its quality.</p>
            </div>

            <div className="live-indicator">
              <span className="live-dot"></span>
              AI MODEL READY
            </div>
          </div>

          <div className="classifier-layout">
            <div className="upload-card">
              <h3>01. Upload Image</h3>
              <p className="card-description">
                Select an image from your computer.
              </p>

              <label className="upload-area" htmlFor="fruit-upload">
                {preview ? (
                  <img
                    src={preview}
                    alt="Selected fruit"
                    className="preview-image"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-symbol">↑</div>
                    <h4>Upload Fruit Image</h4>
                    <p>Click to browse or select an image</p>
                    <span>JPG · JPEG · PNG · WEBP</span>
                  </div>
                )}
              </label>

              <input
                id="fruit-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />

              {selectedFile && (
                <div className="file-name">
                  <span>Selected:</span>
                  <strong>{selectedFile.name}</strong>
                </div>
              )}

              <div className="button-group">
                <button
                  className="primary-button"
                  onClick={handleClassify}
                  disabled={!selectedFile || loading}
                >
                  {loading ? "Analysing..." : "Analyse Image"}
                  {!loading && <span> →</span>}
                </button>

                <button
                  className="secondary-button"
                  onClick={handleReset}
                  disabled={loading || !selectedFile}
                >
                  Reset
                </button>
              </div>

              {loading && (
                <div className="loading-message">
                  <span className="loading-spinner"></span>
                  AI is analysing your fruit image...
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="result-card">
              <h3>02. Classification Result</h3>
              <p className="card-description">
                Your AI prediction will appear here.
              </p>

              {!result ? (
                <div className="empty-result">
                  <div className="result-placeholder-icon">✦</div>
                  <h4>Awaiting Prediction</h4>
                  <p>
                    Upload a fruit image and click Analyse Image to see
                    the classification result.
                  </p>
                </div>
              ) : (
                <div className="prediction-result">
                  <div
                    className={`prediction-banner ${result.className.toLowerCase()}`}
                  >
                    <span className="prediction-symbol">
                      {result.className === "Fresh" ? "✓" : "!"}
                    </span>

                    <div>
                      <span className="prediction-caption">
                        PREDICTED CLASS
                      </span>
                      <h2>{result.className} Fruit</h2>
                    </div>
                  </div>

                  <div className="confidence-section">
                    <div className="confidence-title">
                      <span>Prediction confidence</span>
                      <strong>
                        {(result.confidence * 100).toFixed(2)}%
                      </strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className={`progress-fill ${result.className.toLowerCase()}`}
                        style={{
                          width: `${result.confidence * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="probability-grid">
                    <div className="probability-box fresh-box">
                      <span>FRESH</span>
                      <strong>{freshPercentage}%</strong>
                    </div>

                    <div className="probability-box rotten-box">
                      <span>ROTTEN</span>
                      <strong>{rottenPercentage}%</strong>
                    </div>
                  </div>

                  <p className="result-disclaimer">
                    Prediction is based on the CNN model's image analysis.
                    It is an estimate, not a guarantee of food safety.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="process-section">
          <div className="process-heading">
            <span className="section-label">SIMPLE WORKFLOW</span>
            <h2>How It Works</h2>
          </div>

          <div className="process-grid">
            <div className="process-card">
              <span className="step-number">01</span>
              <h3>Upload</h3>
              <p>Choose an image of a fruit from your device.</p>
            </div>

            <div className="process-card">
              <span className="step-number">02</span>
              <h3>Analyse</h3>
              <p>The CNN model processes the image in your browser.</p>
            </div>

            <div className="process-card">
              <span className="step-number">03</span>
              <h3>Classify</h3>
              <p>View the Fresh or Rotten prediction and scores.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">PRAGYANAI</div>
        <p>AI-Powered Learning · Innovation · Technology</p>
        <span>Fruit Quality Image Classification Application</span>
      </footer>
    </div>
  );
}

export default App;
