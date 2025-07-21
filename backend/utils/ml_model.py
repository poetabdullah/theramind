<<<<<<< HEAD
import os, re, json, hashlib, random, numpy as np, tensorflow as tf
from sentence_transformers import SentenceTransformer
from nltk.corpus import wordnet as wn
import nltk
from django.conf import settings

wn.ensure_loaded()

# === Paths & NLTK ===
=======
import os, re, json, hashlib, random, numpy as np
import nltk
from nltk.corpus import wordnet as wn
from django.conf import settings

# Ensure NLTK data
>>>>>>> 8cf5bdd81a2abff589e78d943dee3c86d865f4b8
BASE = settings.ML_MODELS_DIR
for pkg in ("punkt", "wordnet", "omw-1.4"):
    nltk.download(pkg, download_dir=os.path.join(BASE, "nltk_data"))
os.environ["NLTK_DATA"] = os.path.join(BASE, "nltk_data")
<<<<<<< HEAD

# === Seeds for reproducibility ===
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)
os.environ["PYTHONHASHSEED"] = str(SEED)

# === Load models once ===
sbert = clf = cfg = None
=======
wn.ensure_loaded()

# Reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
os.environ["PYTHONHASHSEED"] = str(SEED)

# Globals
sbert = None
clf = None
cfg = None

# Lazy-load heavy ML libs
>>>>>>> 8cf5bdd81a2abff589e78d943dee3c86d865f4b8


def load_models():
    global sbert, clf, cfg
<<<<<<< HEAD
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
=======
    # Import inside function to avoid startup errors
    from sentence_transformers import SentenceTransformer
    import keras
    import absl.logging

    absl.logging.set_verbosity(absl.logging.ERROR)  # Remove carbon error output

    # Load SBERT
    if sbert is None:
        sbert_path = os.path.join(BASE, "final_fine_tuned_sbert_model")
        sbert = SentenceTransformer(sbert_path)
        sbert.eval()

    # Load classifier
    if clf is None:
        clf_path = os.path.join(BASE, "final_mh_classifier.h5")
        clf = keras.models.load_model(clf_path)
        # Set seed
        keras.utils.set_random_seed(SEED)

    # Load config
    if cfg is None:
        cfg_path = os.path.join(BASE, "model_config.json")
        with open(cfg_path) as f:
            cfg = json.load(f)


# Text cleaning


def clean_html(html: str):
    text = re.sub(r"<[^>]+>", "", html)
    return nltk.tokenize.sent_tokenize(text)


# Embedding


def get_embed(html: str):
    load_models()
>>>>>>> 8cf5bdd81a2abff589e78d943dee3c86d865f4b8
    sents = clean_html(html)
    embs = sbert.encode(sents, convert_to_tensor=False)
    L, D = cfg["MAX_SEQ_LEN"], cfg["EMBED_DIM"]
    if len(embs) < L:
<<<<<<< HEAD
        embs = list(embs) + [[0.0] * D] * (L - len(embs))
=======
        embs += [[0.0] * D] * (L - len(embs))
>>>>>>> 8cf5bdd81a2abff589e78d943dee3c86d865f4b8
    else:
        embs = embs[:L]
    return np.array([embs], dtype=np.float32)


<<<<<<< HEAD
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
=======
# Confidence score


def confidence_score(html: str) -> float:
    emb = get_embed(html)
    pred = clf.predict(emb)
    if not (hasattr(pred, "__len__") and len(pred[0]) == 2):
        raise RuntimeError(f"Unexpected model output: {pred}")
    return float(pred[0][1])


# TTA vote


def tta_vote(html: str, n: int = 7) -> bool:
    votes = 0
>>>>>>> 8cf5bdd81a2abff589e78d943dee3c86d865f4b8
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
<<<<<<< HEAD
            base_votes += 1
    return base_votes >= 5  # require majority


# === Keyword override ===
=======
            votes += 1
    return votes >= (n // 2 + 1)


# Keyword override

>>>>>>> 8cf5bdd81a2abff589e78d943dee3c86d865f4b8
KEYWORDS = [
    "anxiety",
    "depression",
    "therapy",
    "panic",
    "fear",
<<<<<<< HEAD
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
=======
    # ...
]


def keyword_override(html: str) -> bool:
>>>>>>> 8cf5bdd81a2abff589e78d943dee3c86d865f4b8
    text = html.lower()
    return sum(kw in text for kw in KEYWORDS) >= 2


<<<<<<< HEAD
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
=======
# Caching & decision

_CACHE = {}


def final_mh_decision(html: str) -> dict:
    key = hashlib.md5(html.encode()).hexdigest()
    if key in _CACHE:
        return _CACHE[key]

    load_models()
    conf = confidence_score(html)
    res = {
        "confidence_score": round(conf, 3),
        "confidence_pass": conf >= 0.75,
        "tta_pass": tta_vote(html),
        "override_pass": keyword_override(html),
    }
    votes = sum(res.values())
    res.update(
        {
            "valid": votes >= 1,
            "votes": votes,
            "note": (
                "Allowed by ensemble"
                if votes >= 2
                else (
                    "Allowed by override"
                    if res["override_pass"]
                    else "Blocking — insufficient MH signal"
                )
            ),
        }
    )
    _CACHE[key] = res
    return res
>>>>>>> 8cf5bdd81a2abff589e78d943dee3c86d865f4b8
