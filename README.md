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
| `images/work/` | Portfolio pieces as WebP (full size) + `thumb/` (640px WebP for gallery tiles) |
| `videos/` | Showreel, plus `anim/` for animated explainers and video ads (720p web encodes + posters) |

## Libraries (CDN)

GSAP + ScrollTrigger, Font Awesome. Everything respects `prefers-reduced-motion`.

## Local preview

Open `index.html` in a browser, or serve the folder (e.g. `npx serve .`).

## Performance

- Images are WebP; gallery tiles load small thumbnails, the viewer loads the full image.
- `vercel.json` lets browsers cache `images/` and `videos/` for 30 days. When you replace one of
  those files, give it a **new file name** (e.g. `showreel-2027.mp4`) so visitors get the new one.
- The carousel showreel only downloads when it is about to play.

### Adding a new gallery image

1. Full size: `ffmpeg -i in.jpg -c:v libwebp -quality 80 images/work/NAME.webp`
2. Thumbnail: `ffmpeg -i in.jpg -vf "scale='min(640,iw)':-2" -c:v libwebp -quality 74 images/work/thumb/NAME.webp`
3. Add `{ src: "NAME", ... }` to `WORK` in `work.js`.
