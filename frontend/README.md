# Portfolio front end

React 18 + Vite + Tailwind CSS 3 single page application for the
NIBISHAKA CEDRICK portfolio, including the full admin dashboard.

## Requirements

- Node.js 18+
- The API from `../backend` running on `http://localhost:4000`

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

`npm run build` produces the production bundle in `dist/`, `npm run preview`
serves it locally and `npm run lint` runs ESLint.

## Configuration

| Variable           | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `VITE_API_URL`     | API origin. Leave empty to use the same origin           |
| `VITE_API_TARGET`  | Origin the Vite dev proxy forwards `/api` and `/uploads` to |

The Vite dev server proxies `/api` and `/uploads` to the backend, so the app
uses relative URLs in development. In production set `VITE_API_URL` to the
public API origin (or serve both behind the same host and reverse proxy).

## Public site

| Route          | Page                                                     |
| -------------- | -------------------------------------------------------- |
| `/`            | Home: hero, about, skills, services, experience, testimonials, achievements, certificates, explore links, contact |
| `/projects`    | Every project with category filters                      |
| `/education`   | Education background and work experience                 |
| `/blog`        | Blog index with category filters                         |
| `/blog/:slug`  | Article page                                             |
| `*`            | 404 page                                                 |

The home page stays short on purpose: projects, education and blog live on
their own routes and the "More Content" section links to them.

The floating chat widget talks to `POST /api/ai/chat` and keeps the session id
in `localStorage` so the conversation survives a reload.

## Admin dashboard

| Route                    | Page                                            |
| ------------------------ | ----------------------------------------------- |
| `/admin/login`           | Sign in                                          |
| `/admin`                 | Dashboard with statistics, recent messages/visitors |
| `/admin/projects`        | Projects                                         |
| `/admin/skills`          | Skills                                           |
| `/admin/services`        | Services                                         |
| `/admin/experience`      | Work experience                                  |
| `/admin/education`       | Education                                        |
| `/admin/certificates`    | Certificates                                     |
| `/admin/testimonials`    | Testimonials                                     |
| `/admin/achievements`    | Achievements                                     |
| `/admin/social-links`    | Social links                                     |
| `/admin/blogs`           | Blog posts                                       |
| `/admin/blog-categories` | Blog categories                                  |
| `/admin/messages`        | Inbox                                            |
| `/admin/resume`          | CV upload, activation and downloads              |
| `/admin/uploads`         | Generic image and PDF uploader                    |
| `/admin/site-info`       | Hero, owner and pricing settings                 |
| `/admin/ai-settings`     | Chat assistant configuration                     |

The token is stored in `localStorage` under `cedrick-admin-token` and sent as
`Authorization: Bearer <token>`.

Every collection screen is rendered by the config driven
`admin/pages/ResourcePage.jsx`; the field and column definitions live in
`admin/config/resources.js`. Adding a new field to a collection only means
editing that config.

## Structure

```
src/
  api/client.js            fetch wrapper that unwraps the API envelope
  admin/                   the admin SPA
    AdminApp.jsx           routes
    AdminAuth.jsx          token handling
    components/            layout, table, form and upload widgets
    config/resources.js    field + column definitions per collection
    pages/                 dashboard, messages, resume, settings, uploads
  components/
    chat/ChatWidget.jsx    AI assistant widget
    layout/                navbar, footer, back to top
    sections/              the landing page sections
    ui/                    shared building blocks
  context/PortfolioContext.jsx
  hooks/                   typing effect and count up
  pages/                   home, projects, education, blog, blog post, 404
  utils/format.js          date, list and asset helpers
```

## Design

The palette comes from the reference design:

| Token       | Hex      |
| ----------- | -------- |
| `primary-500` | `#4AAEA6` |
| `primary-300` | `#93CCC5` |
| `primary-200` | `#C3E6E2` |
| `primary-50`  | `#F2F8F4` |
| `sand-300`    | `#DEC0B5` |
| `ink`         | `#241F1A` |

Fonts: Poppins (Google Fonts). Icons: Font Awesome 6 (CDN).
Continue  opencode -s ses_ea22789acffeUUOIQqFshzBUws
