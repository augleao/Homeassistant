import os
import threading
from msal import SerializableTokenCache

try:
    from cryptography.fernet import Fernet, InvalidToken
except Exception:
    Fernet = None

    class InvalidToken(Exception):
        pass


class TokenCacheStorage:
    def __init__(self, path='token_cache.bin', key=None):
        self.path = path
        self._lock = threading.Lock()
        self.key = key or os.environ.get('SECURE_KEY')
        self._fernet = None
        if self.key and Fernet:
            try:
                self._fernet = Fernet(self.key)
            except Exception:
                # Invalid key format: keep cache functional without encryption.
                self._fernet = None

    def load(self):
        cache = SerializableTokenCache()
        if not os.path.exists(self.path):
            return cache
        with self._lock:
            with open(self.path, 'rb') as f:
                data = f.read()
            if not data:
                return cache
            try:
                if self._fernet:
                    data = self._fernet.decrypt(data)
                cache.deserialize(data.decode('utf-8'))
            except InvalidToken:
                # cannot decrypt — return empty cache
                return SerializableTokenCache()
        return cache

    def save(self, cache: SerializableTokenCache):
        data = cache.serialize().encode('utf-8')
        if self._fernet:
            data = self._fernet.encrypt(data)
        with self._lock:
            with open(self.path, 'wb') as f:
                f.write(data)
            try:
                os.chmod(self.path, 0o600)
            except Exception:
                pass
