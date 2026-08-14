# CyberSage

CyberSage is a React + Vite single-page application for visualizing cybersecurity data: dashboards, attack surface maps, AI agents, reports, and scan details.

## Contents

- `Frontend/` — Vite + React application (UI components, pages, utilities)

## Quick start (frontend)

1. Install dependencies and run the dev server:

```bash
cd Frontend
npm install
npm run dev
```

2. Build for production:

```bash
cd Frontend
npm run build
```

3. Preview the production build:

```bash
cd Frontend
npm run preview
```

## Development notes

- The frontend uses Vite, React, and Tailwind CSS. Source is under `Frontend/src/`.
- Entry points: `Frontend/src/main.tsx` and `Frontend/index.html`.
- Common directories:
  - `components/` — reusable UI components
  - `pages/` — route pages (Dashboard, Reports, Vulnerabilities, etc.)
  - `lib/` — utilities
  - `data/` — mock data and fixtures

## Contributing

- Create a feature branch (`feature/` or `fix/`) and open a PR against `main`.
- Include screenshots or repro steps for UI changes.

## License

Add a `LICENSE` file to specify the project license.

---

If you want, I can also remove the `readme/` folder (now duplicate) or add a `Frontend/README.md` with more details.
