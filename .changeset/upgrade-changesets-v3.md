---
'quote0': patch
---

Migrate from Changesets v2 to v3.

- Upgrade `@changesets/cli` from 2.x to 3.x and point the config schema at `@changesets/config` v4, with `format: oxfmt` for generated files.
- Move versioned alpha prerelease changesets to `.changeset/pre/`.
- Rewrite the Release workflow to `changesets/action@v2` with separate select-mode, version, pack, and OIDC publish jobs.
