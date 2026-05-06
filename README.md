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

Analytics stays disabled until the ID is filled in. Once enabled, the site tracks page views plus WhatsApp, email, map, and menu CTA clicks.

## GitHub Pages

Push this folder to a GitHub repository, then enable GitHub Pages from the repository settings. Use the root folder as the publishing source.
