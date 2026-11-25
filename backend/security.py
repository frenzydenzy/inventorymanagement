import os
import base64
import hashlib
import hmac
from datetime import datetime, timedelta, timezone

import jwt  # type: ignore[import-not-found]
from dotenv import load_dotenv


load_dotenv()


_PASSWORD_HASH_PREFIX = "$scrypt$"
_PASSWORD_SALT_LENGTH = 16


def hash_password(password: str) -> str:
    salt = os.urandom(_PASSWORD_SALT_LENGTH)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=2**14,
        r=8,
        p=1,
    )
    encoded = base64.urlsafe_b64encode(salt + digest).decode("ascii")
    return f"{_PASSWORD_HASH_PREFIX}{encoded}"


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    try:
        if not hashed_password.startswith(_PASSWORD_HASH_PREFIX):
            return False

        raw = base64.urlsafe_b64decode(
            hashed_password[len(_PASSWORD_HASH_PREFIX):].encode("ascii")
        )
        salt = raw[:_PASSWORD_SALT_LENGTH]
        expected_digest = raw[_PASSWORD_SALT_LENGTH:]
        actual_digest = hashlib.scrypt(
            plain_password.encode("utf-8"),
            salt=salt,
            n=2**14,
            r=8,
            p=1,
        )
        return hmac.compare_digest(actual_digest, expected_digest)
    except (TypeError, ValueError):
        return False


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
) -> str:

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    return encoded_jwt