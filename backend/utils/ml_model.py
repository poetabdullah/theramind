import os, re, json, hashlib, random, numpy as np
import nltk
from nltk.corpus import wordnet as wn
from django.conf import settings

# Ensure NLTK data
BASE = settings.ML_MODELS_DIR
for pkg in ("punkt", "wordnet", "omw-1.4"):
    nltk.download(pkg, download_dir=os.path.join(BASE, "nltk_data"))
os.environ["NLTK_DATA"] = os.path.join(BASE, "nltk_data")
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


def load_models():
    global sbert, clf, cfg
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
    sents = clean_html(html)
    embs = sbert.encode(sents, convert_to_tensor=False)
    L, D = cfg["MAX_SEQ_LEN"], cfg["EMBED_DIM"]
    if len(embs) < L:
        embs += [[0.0] * D] * (L - len(embs))
    else:
        embs = embs[:L]
    return np.array([embs], dtype=np.float32)


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
            votes += 1
    return votes >= (n // 2 + 1)


# Keyword override

KEYWORDS = [
    "anxiety",
    "depression",
    "therapy",
    "panic",
    "fear",
    # ...
]


def keyword_override(html: str) -> bool:
    text = html.lower()
    return sum(kw in text for kw in KEYWORDS) >= 2


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
