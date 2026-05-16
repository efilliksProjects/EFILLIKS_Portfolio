# EFILLIKS — Portfolio Website

Production-ready portfolio site for a full-stack tech services company with software, hardware/IoT, and a proprietary LMS-like platform (EFILLIKS Learn).

---

## Quick Start

### No build step required
This is a pure HTML/CSS/JS site. Just open `index.html` in a browser or serve it statically.

```bash
# Option 1 — Python (any machine)
cd portfolio_ef
python3 -m http.server 3000

# Option 2 — Node (npx)
cd portfolio_ef
npx serve .

# Option 3 — VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

---

## File Structure

```
portfolio_ef/
├── index.html          ← Full single-page app
├── css/
│   └── styles.css      ← All styling, animations, responsive
├── js/
│   └── main.js         ← All interactivity, canvas, forms
└── README.md
```

---

## Rebrand Guide

Find-and-replace these tokens in `index.html`:

| Token | Replace with |
|---|---|
| `EF Technologies` | Your company name |
| `Engineering Tomorrow` | Your tagline |
| `hello@eftechnologies.io` | Your email |
| `+1 (555) 000-0000` | Your phone |
| `EF Learn` | Your platform name |
| `app.eflearn.io` | Your platform URL |

To change colours, edit the CSS custom properties at the top of `css/styles.css` (`:root { ... }`).

---

## Integrations

### 1. Demo Booking (Calendly / Cal.com)

Find the `<!-- CALENDLY INTEGRATION -->` comment in `index.html` near the `#demoModal` section.

**Calendly steps:**
1. Log in → Event Types → select your event
2. Share → Add to Website → Inline Widget
3. Copy the `<div class="calendly-inline-widget" ...>` snippet
4. Replace the `.calendly-ph` placeholder div with it
5. Add the `<script>` tag just before `</body>`

**Cal.com alternative:** Cal.com has an identical inline embed API. Same process, different URL.

---

### 2. Contact Form Backend

In `js/main.js`, find the `FORM BACKEND INTEGRATION` comment inside `initContactForm()`.

**Option A — Formspree (recommended, free tier available)**
1. Sign up at [formspree.io](https://formspree.io)
2. Create a form, copy the endpoint URL
3. Add `action="https://formspree.io/f/YOUR_FORM_ID" method="POST"` to the `<form>` tag in `index.html`
4. Uncomment the fetch block in `main.js`, remove the simulation timeout

**Option B — Netlify Forms (if deploying to Netlify)**
1. Add `data-netlify="true" name="contact"` to the `<form>` tag
2. Add `<input type="hidden" name="form-name" value="contact">` inside the form
3. Deploy — Netlify auto-detects and handles submissions

**Option C — Your own API**
Replace the `await new Promise(...)` simulation in `main.js` with a `fetch()` to your endpoint.

---

### 3. Newsletter Signup

In `js/main.js`, find `initNewsletter()`. Replace the success handler with your provider's API call (Mailchimp, ConvertKit, Beehiiv, etc.).

---

## Deployment

### Netlify (recommended — free)
```bash
# Drag-and-drop: netlify.com/drop
# Or CLI:
npm i -g netlify-cli
netlify deploy --dir=. --prod
```

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### GitHub Pages
1. Push repo to GitHub
2. Settings → Pages → Source: `main` branch, `/` root
3. Your site is live at `https://USERNAME.github.io/REPO`

### Traditional hosting
Upload all files via FTP/SFTP to your web host's public root.

---

## Adding Real Case Study Images

Replace the CSS gradient thumbnails (`.pf-grad-1` through `.pf-grad-6`) with `<img>` tags inside `.pf-thumb`. Current gradients serve as designed placeholders.

---

## WCAG / Accessibility

- All interactive elements have accessible labels
- Custom cursor degrades gracefully on touch devices
- Skip-to-content link can be added before `<header>` if needed
- Animations respect `prefers-reduced-motion`
- Form errors are announced via `role="alert"`

---

## Performance Notes

- All animations use `transform` and `opacity` — no layout thrashing
- Canvas particle system auto-pauses when `prefers-reduced-motion` is set
- GSAP and Font Awesome are loaded from CDN with `crossorigin`; swap for local copies for offline-safe deployments
- Target Lighthouse score: 90+ on all categories after adding real images
