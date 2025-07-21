import os, re, json, hashlib, random, numpy as np, tensorflow as tf
from sentence_transformers import SentenceTransformer
from nltk.corpus import wordnet as wn
import nltk
from django.conf import settings

wn.ensure_loaded()

# === Paths & NLTK ===
BASE = settings.ML_MODELS_DIR
for pkg in ("punkt", "wordnet", "omw-1.4"):
    nltk.download(pkg, download_dir=os.path.join(BASE, "nltk_data"))
os.environ["NLTK_DATA"] = os.path.join(BASE, "nltk_data")

# === Seeds for reproducibility ===
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)
os.environ["PYTHONHASHSEED"] = str(SEED)

# === Load models once ===
sbert = clf = cfg = None


def load_models():
    global sbert, clf, cfg
    if not sbert:
        sbert = SentenceTransformer(os.path.join(BASE, "final_fine_tuned_sbert_model"))
        sbert.eval()
    if not clf:
        clf = tf.keras.models.load_model(os.path.join(BASE, "final_mh_classifier.h5"))
    if not cfg:
        cfg = json.load(open(os.path.join(BASE, "model_config.json")))


# === Preprocessing ===
def clean_html(html: str):
    return nltk.tokenize.sent_tokenize(re.sub(r"<[^>]+>", "", html))


def get_embed(html):
    sents = clean_html(html)
    embs = sbert.encode(sents, convert_to_tensor=False)
    L, D = cfg["MAX_SEQ_LEN"], cfg["EMBED_DIM"]
    if len(embs) < L:
        embs = list(embs) + [[0.0] * D] * (L - len(embs))
    else:
        embs = embs[:L]
    return np.array([embs], dtype=np.float32)


# === Confidence check ===
def confidence_score(html):
    emb = get_embed(html)
    try:
        prediction = clf.predict(emb)
        if not isinstance(prediction, (np.ndarray, list)) or len(prediction[0]) != 2:
            raise ValueError(f"Unexpected prediction output: {prediction}")
        return float(prediction[0][1])
    except Exception as e:
        raise RuntimeError(f"Prediction failed: {str(e)}")


# === Stabilized TTA ===
def tta_vote(html, n=7):
    base_votes = 0
    sents = clean_html(html)
    for i in range(n):
        random.seed(SEED + i)
        aug = []
        for sent in sents:
            words = sent.split()
            for w in random.sample(words, min(2, len(words))):
                syns = wn.synsets(w)
                lemmas = {
                    l.name().replace("_", " ")
                    for s in syns
                    for l in s.lemmas()
                    if l.name() != w
                }
                if lemmas:
                    words[words.index(w)] = random.choice(list(lemmas))
            aug.append(" ".join(words))
        if confidence_score(" ".join(aug)) >= 0.65:
            base_votes += 1
    return base_votes >= 5  # require majority


# === Keyword override ===
KEYWORDS = [
    "anxiety",
    "depression",
    "therapy",
    "panic",
    "fear",
    "healing",
    "resilience",
    "mental health",
    "journaling",
    "meditation",
    "mindfulness",
    "postpartum depression",
    "atypical depression",
    "major depressive disorder",
    "panic disorder",
    "separation anxiety disorder",
    "disorder",
    "heal",
    "ocd",
    "symmetry ocd",
    "checking ocd",
    "self care",
    "trauma",
    "developmental trauma",
    "acute stress",
    "episodic acute stress",
    "chronic stress",
    "generalized anxiety disorder",
    "resilience",
]


def keyword_override(html):
    text = html.lower()
    return sum(kw in text for kw in KEYWORDS) >= 2


# === Caching (avoid reruns) ===
_CACHE = {}


def final_mh_decision(html: str):
    h = hashlib.md5(html.encode("utf-8")).hexdigest()
    if h in _CACHE:
        return _CACHE[h]

    print("🧠 Running AI moderation pipeline...")  # Log entry

    load_models()
    conf = confidence_score(html)
    conf_pass = conf >= 0.75
    tta_pass = tta_vote(html)
    over_pass = keyword_override(html)
    votes = sum([conf_pass, tta_pass, over_pass])
    valid = votes >= 1

    result = {
        "valid": valid,
        "confidence_score": round(conf, 3),
        "confidence_pass": conf_pass,
        "tta_pass": tta_pass,
        "override_pass": over_pass,
        "votes": votes,
        "note": (
            "Allowed by ensemble"
            if votes >= 2
            else (
                "Allowed by override"
                if over_pass
                else "Blocking — insufficient MH signal"
            )
        ),
    }
    _CACHE[h] = result
    return result
