# Lawrence — Portfolio

Personal portfolio for Lawrence, Marketing Automation & Funnel Specialist.

Static HTML/CSS/JS with no build step. Pushing to `main` deploys to Vercel automatically.

## Structure

| File | Purpose |
|---|---|
| `index.html` | All page sections |
| `style.css` | Styles (design tokens first, then one banner per section) |
| `script.js` | Navigation, reveals, contact form, experience accordion, Lead Rush game |
| `scroll-fx.js` | Split headings, hero motion, Lenis smooth scroll, GSAP/ScrollTrigger scenes |
| `work.js` | Work data, 3D carousel, gallery filters, lightbox |
| `bg-flow.js` | Animated background lines |
| `samurai-intro.js/.css` | Intro animation (once per session) |
| `images/work/` | Portfolio pieces |
| `videos/` | Showreel |

## Motion

- CSS handles entrances (`.reveal`, `[data-clip]`, the hero) so content still shows if a CDN script fails.
- GSAP + ScrollTrigger handle scroll-linked scenes: hero parallax, the About statement, the pinned
  "How it works" story on wide screens, the experience rail and the carousel entrance.
- Lenis smooth scroll runs on mouse/trackpad devices only; touch keeps native scrolling.
- Everything respects `prefers-reduced-motion`: content is fully visible and nothing is pinned or scrubbed.

## Libraries (CDN)

GSAP + ScrollTrigger, Lenis, Font Awesome, Google Fonts (Sora, Inter).

## Local preview

Serve the folder (e.g. `python -m http.server`) and open it in a browser.

## Fallback design

The git tag `base-version` marks the earlier design.
