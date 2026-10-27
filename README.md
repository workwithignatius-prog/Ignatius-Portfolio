# Ignatius-Portfolio
My Portfolio works done here

## Environments

| Branch | Environment | What happens on push |
|--------|-------------|----------------------|
| `main` | Development | Dev checks run. Nothing is published. |
| `Prod` | Production  | `site/` is deployed to GitHub Pages (the live domain). |

## Workflow

1. Work on `main` (or a feature branch merged into `main`).
2. Preview locally: open `site/index.html`, or run `python3 -m http.server -d site 8000`.
3. When it's ready to go live, open a pull request from `main` into `Prod` and merge it.
4. The **Deploy production** workflow publishes the site.

The site lives in `site/`; only that folder is published.
