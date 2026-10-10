# React + Vite

## Bitrix24 local application

Use the public production URL as the Bitrix24 application handler:

```text
https://bitrix-warehouses-phi.vercel.app/
```

Bitrix24 loads a local application handler with `POST`. The root Vercel rewrite
passes that request to `api/app.js`, which responds with `303 See Other` and
loads the static SPA using `GET /index.html`. Do not configure Bitrix with a
deployment-specific `*-sergogyulinyan89-4136s-projects.vercel.app` URL: those
deployments require Vercel authentication and cannot be displayed in an iframe.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
