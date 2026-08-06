# Samurai slash intro — install

Copy these three files into the root of `lawrencevaldenebro/Portfolio` (next to `style.css`):

- `samurai-intro.css`
- `samurai-intro.js`
- `index.html` (already patched — it is your file plus two lines in `<head>`)

If you'd rather patch your own `index.html` by hand, add these after the Font Awesome link:

```html
<link rel="stylesheet" href="./samurai-intro.css" />
<script src="./samurai-intro.js" defer></script>
```

Commit and push — Vercel redeploys automatically.

## Behaviour

- Plays once per browser session (`sessionStorage` key `si-intro-played`).
- Click anywhere, press Esc/Space/Enter, or hit Skip to end it early.
- Skipped entirely for visitors with reduced-motion enabled.
- Replay from the console: `SamuraiIntro.play({ force: true })`.
- Total runtime 3.4s.
