# Testing

From `Backend`:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pytest
```

From `Frontend`:

```powershell
npm run build
```

Backend tests cover core health, CORS, optional component reporting, authorization confirmation, SSRF-safe local/remote URL handling, and authorized draft assessment creation.
