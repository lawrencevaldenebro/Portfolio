# Lawrence — Portfolio

Personal portfolio for Lawrence, Marketing Automation & Funnel Specialist.

Static HTML/CSS/JS with no build step. Pushing to `main` deploys to Vercel automatically.

## Structure

| File | Purpose |
|---|---|
| `index.html` | All page sections |
| `style.css` | Styles (numbered sections) |
| `script.js` | Navigation, contact form, Lead Rush game |
| `scroll-fx.js` | GSAP/ScrollTrigger scenes, kinetic headings |
| `work.js` | Work data, 3D carousel, gallery filters, lightbox |
| `samurai-intro.js/.css` | Intro animation (once per session) |
| `images/work/` | Portfolio pieces |
| `videos/` | Showreel, plus `anim/` for animated explainers and video ads (720p web encodes + posters) |

## Libraries (CDN)

GSAP + ScrollTrigger, Font Awesome. Everything respects `prefers-reduced-motion`.

## Local preview

Open `index.html` in a browser, or serve the folder (e.g. `npx serve .`).
