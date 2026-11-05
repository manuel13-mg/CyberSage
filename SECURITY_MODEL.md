# CyberSage security model

Phase 2 accepts only HTTP and HTTPS target URLs without embedded credentials. Remote loopback, private, link-local, and reserved IP targets are rejected. Local lab targets must explicitly use the `local_lab` environment.

Every target requires explicit authorization confirmation and stores the confirmation timestamp and notes. Assessment creation requires an enabled target with confirmed authorization. Allowed domains must include the target hostname; subdomains require explicit opt-in.

No scanner commands execute in Phase 2. No arbitrary shell execution occurs. Gemini keys are read only by backend settings and never returned to the frontend.
