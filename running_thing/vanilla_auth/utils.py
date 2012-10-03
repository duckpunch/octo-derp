import hashlib
from django.conf import settings

def make_digest_from_user(user):
    digest = hashlib.sha224()
    digest.update(user.email)
    digest.update(user.password)
    digest.update(user.username)
    digest.update(settings.USER_HASH)
    return digest.hexdigest()
