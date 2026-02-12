import firebase_admin
from firebase_admin import credentials, storage, firestore

# Initialize Firebase Admin
# For local dev, we need service account credentials. 
# For Cloud Run/App Hosting, it uses default credentials automatically.
if not firebase_admin._apps:
    try:
        # Check for service account json in env or file
        cred = credentials.Certificate("serviceAccountKey.json") if "serviceAccountKey.json" in os.listdir() else credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'modeliqv2.firebasestorage.app',
            'projectId': 'modeliqv2',
        })
    except Exception as e:
        print(f"Warning: Firebase Admin Not Initialized: {e}")

db = firestore.client()
bucket = storage.bucket()

def verify_token(token):
    from firebase_admin import auth
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        return None
