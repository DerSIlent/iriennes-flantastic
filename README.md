# Irienne's Flantastic!

Static GitHub Pages site for Irienne's Flantastic, a homemade quesillo page for Aruba. The current design uses a playful Dribbble-style direction inspired by the business card and price list: lilac, caramel orange, custard yellow, soft blush, and a smiling flan favicon.

## Files

- `index.html` - page content and links
- `styles.css` - custom responsive styling
- `script.js` - mobile menu behavior
- `assets/quesillo-video.mp4` - hero video
- `assets/quesillo-poster.jpg` - video poster image
- `assets/favicon.svg` - flan mascot favicon

## Analytics

Add the GA4 Measurement ID in `index.html`:

```html
window.iriennesAnalytics = {
  measurementId: "G-XXXXXXXXXX"
};
```

Analytics stays disabled until the ID is filled in and the visitor accepts analytics in the cookie banner. Once enabled, the site tracks page views plus WhatsApp, email, map, and menu CTA clicks.

## Cookie / Privacy Banner

Because the site uses GA4, it includes a lighthearted cookie banner that explains Google Analytics in plain language and lets visitors choose between analytics cookies and essentials only.

GA4 only loads after the visitor accepts analytics cookies. The choice is stored in `localStorage` under `iriennes_analytics_consent`, and the footer includes a "Cookie choices" button so visitors can reopen the banner.

Reference links:

- ChatGPT discussion: https://chatgpt.com/c/6a1afd74-6914-832b-b26f-2c2d411e37a2
- Banner/policy reference screenshot: https://gyazo.com/1aa031da0c36fcb160357dece47b687c

## GitHub Pages

Push this folder to a GitHub repository, then enable GitHub Pages from the repository settings. Use the root folder as the publishing source.
