from django.conf import settings
import os
import json
import numpy as np
import tensorflow as tf
from sentence_transformers import SentenceTransformer
import nltk
import re

# === Set NLTK data path ===
BASE = settings.ML_MODELS_DIR
nltk_data_path = os.path.join(BASE, "nltk_data")
os.environ["NLTK_DATA"] = nltk_data_path

# 🔧 Ensure both required punkt resources are downloaded to correct folder
nltk.download("punkt", download_dir=nltk_data_path)
nltk.download("punkt_tab", download_dir=nltk_data_path)

# === Paths for ML assets ===
SBERT_PATH = os.path.join(BASE, "final_fine_tuned_sbert_model")
KERAS_PATH = os.path.join(BASE, "final_mh_classifier.h5")
CONFIG_PATH = os.path.join(BASE, "model_config.json")

# === Assert model file exists ===
assert os.path.exists(KERAS_PATH), f"Model file not found at {KERAS_PATH}"

# === Lazy-loaded variables ===
sbert = None
clf = None
cfg = None


def load_models():
    global sbert, clf, cfg
    if sbert is None:
        sbert = SentenceTransformer(SBERT_PATH)
    if clf is None:
        clf = tf.keras.models.load_model(KERAS_PATH)
    if cfg is None:
        with open(CONFIG_PATH) as f:
            cfg = json.load(f)


def clean_html_and_tokenize(html: str):
    text = re.sub(r"<[^>]+>", "", html)
    return nltk.tokenize.sent_tokenize(text)


def predict_mh(html_content: str) -> bool:
    load_models()
    sents = clean_html_and_tokenize(html_content)
    embs = sbert.encode(sents, convert_to_tensor=False).tolist()
    L, D = cfg["MAX_SEQ_LEN"], cfg["EMBED_DIM"]
    if len(embs) < L:
        embs += [[0.0] * D] * (L - len(embs))
    else:
        embs = embs[:L]
    arr = np.array([embs], dtype=np.float32)
    probs = clf.predict(arr)[0]
    return int(probs.argmax()) == 1
