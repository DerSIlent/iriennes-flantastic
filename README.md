# Irienne's Flantastic!

Static GitHub Pages site for Irienne's Flantastic, a homemade quesillo page for Aruba. The current design uses a playful Dribbble-style direction inspired by the business card and price list: lilac, caramel orange, custard yellow, soft blush, and a smiling flan favicon.

## Files

- `index.html` - page content and links
- `game.html` - standalone Caramel Catch mini game
- `styles.css` - custom responsive styling
- `script.js` - mobile menu, cookie consent, and analytics link tracking
- `game.js` - Caramel Catch game behavior
- `assets/quesillo-video.mp4` - hero video
- `assets/quesillo-poster.jpg` - video poster image
- `assets/favicon.svg` - flan mascot favicon

## Hero Game

The hero includes a playful **Play Caramel Catch** button that opens `game.html`. The game lives on its own full-screen page so the landing page stays focused on ordering while curious visitors still get a fun extra.

Gameplay notes:

- Move the flan plate with mouse, touch, arrow keys, or A/D.
- Catch regular caramel for points and gold caramel for bonus points.
- Dodge dark burnt caramel, which costs points and breaks the streak.
- The score is shown in the top-right corner of the game stage, with streak on the left.
- There is no time limit or game-over state; visitors can play indefinitely.
- The **Pause (Esc)** button pauses/resumes the game, and the `Esc` key does the same.
- The **Reset score** button clears the score without leaving the game page.
- `game.html` intentionally does not show the site header, footer, or cookie banner so the game can use the whole screen.
- When analytics consent exists, the game sends a GA4 `post_score` event when a play session ends by reset, Home navigation, or page exit.

## Analytics and Privacy

The site uses Google Analytics 4 with a consent banner. The GA4 Measurement ID is configured in `index.html` and `game.html`:

```html
window.iriennesAnalytics = {
  measurementId: "G-722TGK84CT"
};
```

Analytics only loads after the visitor clicks **Accept sprinkles** in the cookie banner. Until then, the Google tag script is not injected and no GA4 page view or CTA event is sent. The game page does not show the banner; it only loads analytics if the visitor already accepted analytics on the main page.

If the visitor clicks **Essentials only**, the site stores that choice locally and keeps GA4 disabled. The choice is saved in `localStorage` under:

```text
iriennes_analytics_consent
```

Possible values:

- `granted` - loads GA4 and tracks page views plus WhatsApp, email, map, and menu CTA clicks.
- `denied` - keeps GA4 off.
- missing value - shows the cookie banner.

Visitors can reopen the banner with the **Cookie choices** button in the footer. To reset consent while testing, clear site data/local storage for the domain or remove `iriennes_analytics_consent` in browser dev tools.

Game score analytics uses the same consent gate. If GA4 is not loaded, score tracking is a no-op. When enabled, the `post_score` event includes:

- `game_name` - `caramel_catch`
- `score` - final score for that play session
- `high_score` - best score reached during that session
- `max_streak` - best streak reached during that session
- `duration_seconds` - approximate session duration
- `finish_reason` - `reset_score`, `home_click`, or `page_exit`

## Cookie / Privacy Banner

The banner is intentionally themed to match the site, with the flan mascot and lighthearted copy. It includes a link to Google's explanation of how data is used on partner sites.

A fuller privacy policy page can be added later if the client wants a dedicated policy URL. For now, the banner explains that analytics is used to understand visits and order-button clicks, and lets visitors opt out before GA4 loads.

Reference links:

- ChatGPT discussion: https://chatgpt.com/c/6a1afd74-6914-832b-b26f-2c2d411e37a2
- Banner/policy reference screenshot: https://gyazo.com/1aa031da0c36fcb160357dece47b687c

## GitHub Pages

The site is deployed with GitHub Pages from the repository root.

Repository: https://github.com/DerSIlent/iriennes-flantastic

Live site: https://dersilent.github.io/iriennes-flantastic/

Deployment uses the workflow in `.github/workflows/pages.yml`. The workflow uploads the root folder:

```yaml
with:
  path: .
```

GitHub Pages should be configured to use **GitHub Actions** as the build/deployment source.
