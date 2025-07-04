import os
import nltk

# point NLTK_DATA to your bundled copy
os.environ['NLTK_DATA'] = os.path.join(os.path.dirname(__file__), '../ml_models/nltk_data')
# (punkt should already be in that folder)
