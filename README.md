# VYRO

Minimal premium hats & glasses storefront (React 19 + Vite + Tailwind 4) with an
integrated admin panel.

## Run

```bash
npm install
npm run dev
```

- Storefront: http://localhost:5173
- Admin panel: http://localhost:5173/admin/login — demo login is `nima1389` / `898989`
  (frontend prototype only; see `docs/admin-panel.md` for security and
  persistence limitations).

## Admin panel

Dashboard, product CRUD with statuses and image management, orders with
six-status workflow, users, media library and store settings. Data persists to
browser localStorage; there is no backend. Details and limitations are
documented in [docs/admin-panel.md](docs/admin-panel.md).

## React + TypeScript + Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
