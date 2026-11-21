# Kamsan Cambodia Travel Guide

Kamsan is a Web Development II final project for the American University of Phnom Penh. It extends a six-page Web I travel website into an interactive travel-planning application for visitors to Cambodia.

## Project Goals

The application helps tourists explore Cambodian destinations, food, activities, culture, and practical travel information. It will use vanilla JavaScript to add dynamic client-side features while keeping the existing responsive HTML and CSS experience.

## Pages

- `index.html`  home page, trip planner, and optional recommendation quiz
- `pages/destinations.html`  destination discovery, weather, search, and favorites
- `pages/favorites.html`  saved favorite destinations
- `pages/food.html`  Khmer food browsing and filtering
- `pages/things-to-do.html`  activity discovery and filtering
- `pages/travel-guide.html`  transport, timing, and practical visitor guidance
- `pages/contact.html`  visitor contact and project information

## Planned Web II Features

- Current weather for Phnom Penh, Siem Reap, Kampot, and Koh Rong via Open-Meteo
- Tourist review CRUD using JSONPlaceholder (`GET`, `POST`, `PUT`, and `DELETE`)
- Immediate search and filtering for destinations, food, and activities
- Browser-persisted favorite destinations with `localStorage`
- A browser-saved trip planner where visitors can add or remove destinations, activities, and food, and see suggestions for selected destinations
- An optional travel-recommendation quiz
- Loading states, error messages, form validation, and accessible DOM updates

Open-Meteo and JSONPlaceholder do not require an API key for the planned basic use. JSONPlaceholder is a demonstration API, so review updates are reflected in the browser but are not permanently stored by the service.

## Technology

- HTML5 and semantic markup
- CSS3 and responsive design
- Vanilla JavaScript (ES6+)
- `fetch()` and `async`/`await`
- Browser APIs: DOM, events, `localStorage`, and `IntersectionObserver`

Node.js is used only for development tooling; there is no application build step or runtime server.

## Project Structure

```text
kamsan-web2-final-project/
├── pages/               # all HTML pages except the home page
│   ├── contact.html
│   ├── destination-phnom-penh.html
│   ├── destinations.html
│   ├── favorites.html
│   ├── food.html
│   ├── things-to-do.html
│   ├── travel-guide.html
│   └── trip-planner.html
├── css/                 # page and shared styles
├── doc/                 # proposal and course documents
├── images/              # website images
├── js/
│   ├── features/        # weather, reviews, favorites, planner, filters, quiz
│   ├── services/        # Open-Meteo and JSONPlaceholder requests
│   ├── utils/           # DOM, validation, and reveal helpers
│   └── main-*.js        # page entry points
├── tests/               # Jest tests
├── index.html           # home page (entry point)
└── .github/workflows/   # CI checks
```

## Local Development

Use Node 20 to match CI. If you use a version manager, `.nvmrc` selects it.

```bash
npm ci
npm run check
```

In VS Code, open `index.html` with the Live Preview extension. Then visit `http://127.0.0.1:3000/pages/destinations.html?vscode-livepreview=true` for weather and destination ratings. The Phnom Penh detail page has the review form. The extension may choose a different port on another computer.

You can also run `python3 -m http.server 8000` and open `http://127.0.0.1:8000`. Do not open the HTML files directly with a `file://` URL: browsers block the site's JavaScript modules in that mode.

### Contact form mock API

The About & Contact modal posts JSON to `http://127.0.0.1:3001/messages`. To set up Mockoon locally:

1. Create a Mockoon environment with port `3001` and no API prefix.
2. Add a data bucket named `Messages` with the initial content `[]` (an empty JSON array).
3. Add a **CRUD route** with path `/messages` and link its default response to the `Messages` bucket. A regular HTTP route will acknowledge requests but will not save them to the bucket.
4. In the environment settings, enable automatic OPTIONS preflight handling. In the environment Headers tab, choose **Add CORS headers** so the browser can read POST responses from the separate site origin.
5. Start the Mockoon environment, serve the site locally, open `pages/contact.html`, and submit the modal form. Visit `http://127.0.0.1:3001/messages` to see the saved JSON objects.

Each saved object includes `id`, `fullName`, `email`, `topic`, `message`, and `createdAt`. Mockoon generates the `id`. Bucket changes last only while the environment is running; restarting it resets the bucket to `[]`. This demo does not send email. If Mockoon uses a different port, update `CONTACT_API_URL` in `js/services/contactApi.js`.

Run the check command before committing:

```bash
npm run check
```

It verifies Prettier formatting, ESLint rules, and Jest tests. A pre-commit hook runs the same command. GitHub Actions runs these checks, a high-severity dependency audit, and a secret scan on pull requests and pushes to `main`.

## Project Status

The static pages, search and filtering, current weather for four destinations, favorite destinations, browser-saved tourist reviews, and a basic browser-saved trip planner are in place. The planner uses curated suggestions for some destinations; the optional quiz still needs implementation. Reviews use readable sample content and JSONPlaceholder for demo HTTP requests; they are not shared between visitors. See `doc/Web-II-Proposal-Implementation-Status.md` for the detailed status.
