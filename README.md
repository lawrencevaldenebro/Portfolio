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
- GSAP + ScrollTrigger handle scroll-linked scenes, one signature moment per section:
  - Hero: copy, photo, frames and chips leave at different depths (desktop)
  - About: the statement lights up word by word
  - Services: a spotlight follows the row on the reading line
  - How it works: pinned story on wide screens (photo wipes, odometer counter, chips); a filling rail elsewhere
  - Experience: a comet rides the rail and each node pulses as it is reached
  - Work: the carousel tips up, the outline word assembles, gallery tiles settle from different depths (desktop)
  - Skills: rows slide against each other with the scroll and lean into fast scrolling (desktop)
  - Contact and footer: the closing line rises word by word, the wordmark letter by letter
- Scroll scenes only touch `transform`, `opacity`, `clip-path` and CSS variables. `gsap.matchMedia` keeps the
  pinned and heavier scenes off phones.
- Lenis smooth scroll runs on mouse/trackpad devices only; touch keeps native scrolling.
- Everything respects `prefers-reduced-motion`: content is fully visible and nothing is pinned or scrubbed.

## Libraries (CDN)

GSAP + ScrollTrigger, Lenis, Font Awesome, Google Fonts (Sora, Inter).

## Local preview

Serve the folder (e.g. `python -m http.server`) and open it in a browser.

## Fallback design

The git tag `base-version` marks the earlier design.
