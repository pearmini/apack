# APack Web Deployment

The `web/` package is a Next.js static export deployed to `apack.bairui.dev`.

## Build

```bash
pnpm web:build
```

Output: `web/out/`

## Routes

| URL | Description |
|-----|-------------|
| `/` | APack editor |
| `/aclock/` | World clocks home |
| `/aclock/local/`, `/aclock/utc/`, `/aclock/{city}/` | Individual clock views |

## Static hosting rewrites

When serving `web/out/` as static files, configure the host so client-side routes work on refresh:

```
/aclock      → /aclock/index.html
/aclock/*    → /aclock/index.html
```

### Nginx example

```nginx
location /aclock {
  try_files $uri $uri/ /aclock/index.html;
}
```

### Cloudflare Pages / Netlify

Add a `_redirects` or `_routes.json` rule:

```
/aclock/*  /aclock/index.html  200
```

## Redirect from aclocks.bairui.dev

Add a 301 redirect on the old subdomain:

```
https://aclocks.bairui.dev/*  →  https://apack.bairui.dev/aclock/
```

## Local development

```bash
pnpm web:dev
```

Open http://localhost:3000
