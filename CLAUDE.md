# Portfolio — Claude Code Notes

## Branching workflow

- Never commit directly to `main`.
- All work goes on a short-lived feature branch: `feat/<topic>`, `fix/<topic>`, or `chore/<topic>`.
- When a task is complete, push the branch and open a PR targeting `main` via `gh pr create`.
- Branch names should be kebab-case and describe the change (e.g. `fix/mobile-nav`, `feat/projects-section`).

## Stack

- Static site: `src/index.html`, `src/css/style.css`, `src/js/main.js`
- Served via Nginx in Docker, hosted on AWS EC2
- Contact form: Formspree (ID `mwvzdeoa`)
- Writing: Hashnode GraphQL API (`carlintheclouds.hashnode.dev`)
- GitHub stats: GitHub REST API + `github-contributions-api.jogruber.de` for contribution grid
