from sentence_transformers import SentenceTransformer

# load once, reuse
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
