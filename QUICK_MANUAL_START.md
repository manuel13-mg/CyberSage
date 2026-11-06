# CyberSage Manual Startup Guide

**If the script has issues, follow these manual steps instead:**

---

## Terminal 1: Start Backend API

```powershell
cd Backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

---

## Terminal 2: Start Frontend (New PowerShell)

```powershell
cd Frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in XXX ms
  Local:    http://127.0.0.1:5173/
```

---

## Terminal 3: Verify Everything Works

```powershell
# Check health
curl http://127.0.0.1:8000/api/v1/health

# Check scanners
curl http://127.0.0.1:8000/api/v1/scanners
```

---

## Open in Browser

- **Frontend:** http://127.0.0.1:5173
- **API:** http://127.0.0.1:8000/docs

---

## Next Steps

1. **Get Gemini API Key** (Optional but recommended):
   - Visit https://aistudio.google.com/
   - Get API key
   - Edit `Backend/.env`
   - Add: `GEMINI_API_KEY=your_key_here`
   - Restart backend

2. **Test with OWASP Juice Shop** (Optional):
   ```powershell
   docker run --rm -p 3000:3000 bkimminich/juice-shop
   ```
   - Register in CyberSage: `http://127.0.0.1:3000`
   - Create assessment
   - Run scan with Nuclei

3. **Start scanning** - Register your first target!

---

**You're all set!** ✓ Nuclei installed, CyberSage ready to go.
