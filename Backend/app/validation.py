import ipaddress
from urllib.parse import urlparse

from fastapi import HTTPException


def normalize_url(value: str, *, local_lab: bool = False) -> str:
    parsed = urlparse(str(value))
    if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username or parsed.password:
        raise HTTPException(status_code=422, detail="A valid HTTP or HTTPS URL without credentials is required")
    host = parsed.hostname.lower().rstrip(".")
    try:
        address = ipaddress.ip_address(host)
    except ValueError:
        address = None
    if address and (address.is_loopback or address.is_private or address.is_link_local or address.is_reserved) and not local_lab:
        raise HTTPException(status_code=422, detail="Private, loopback, and link-local targets require local_lab environment")
    if local_lab and host not in {"localhost", "127.0.0.1", "::1"} and address and not address.is_private:
        raise HTTPException(status_code=422, detail="Local lab targets must resolve to a local address")
    path = parsed.path.rstrip("/")
    return f"{parsed.scheme}://{host}{f':{parsed.port}' if parsed.port else ''}{path}"


def validate_scope(base_url: str, allowed_domains: list[str], allow_subdomains: bool) -> list[str]:
    base_host = urlparse(base_url).hostname
    normalized = [domain.lower().strip().rstrip(".") for domain in allowed_domains if domain.strip()]
    if not base_host or base_host.lower() not in normalized:
        raise HTTPException(status_code=422, detail="Allowed domains must include the target hostname")
    base_host = base_host.lower()
    if not allow_subdomains and any(domain != base_host for domain in normalized):
        raise HTTPException(status_code=422, detail="Subdomains require explicit allow_subdomains confirmation")
    if allow_subdomains and any(domain != base_host and not domain.endswith(f".{base_host}") for domain in normalized):
        raise HTTPException(status_code=422, detail="Allowed domains must belong to the target hostname")
    return normalized
