# Portfolio API

Node.js / Express / MongoDB backend for the NIBISHAKA CEDRICK portfolio.

It replaces the legacy PHP application. All content now lives in MongoDB
and every response keeps the legacy envelope so the front end stays a drop-in
replacement.

## Requirements

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017/portfolio_db` by default)

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values
npm run seed              # load the portfolio content into MongoDB
npm run dev               # http://localhost:4000
```

Production start: `npm start`.

## Scripts

| Script             | Description                                       |
| ------------------ | ------------------------------------------------- |
| `npm start`        | Starts the API server                            |
| `npm run dev`      | Starts the API with `--watch`                    |
| `npm run seed`     | Loads the content snapshot into MongoDB         |
| `npm run seed:fresh`| Drops the collections and re-imports everything  |
| `npm run lint`     | Runs ESLint                                      |

## Configuration

Every value lives in `.env` (see `.env.example`).

| Variable                | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `PORT`                  | HTTP port (default `4000`)                         |
| `NODE_ENV`              | `development` or `production`                      |
| `MONGODB_URI`           | MongoDB connection string                          |
| `JWT_SECRET`            | Secret used to sign the admin tokens               |
| `JWT_EXPIRY`            | Token lifetime in seconds (default `86400`)   |
| `EJOLABS_API_KEY`       | EJoAI key for the chat assistant                   |
| `CLIENT_ORIGIN`         | Allowed CORS origin in production                  |
| `UPLOAD_MAX_SIZE`       | Maximum upload size in bytes                       |

## Response envelope

```jsonc
// success
{ "success": true, "message": "Success", "data": { } }

// error
{ "success": false, "message": "Title is required", "errors": { } }
```

Validation failures answer with HTTP `422`, auth failures with `401`, and
unknown resources with `404`.

## Endpoints

### Public

| Method | Path                              | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/api/health`                     | Liveness probe                       |
| GET    | `/api/portfolio/profile`          | Site information + settings + CV     |
| GET    | `/api/portfolio/settings`         | Settings and site information        |
| GET    | `/api/portfolio/skills`           | Skills grouped by category           |
| GET    | `/api/portfolio/services`         | Services                             |
| GET    | `/api/portfolio/projects`         | Projects (`?limit=`, `?featured=1`)  |
| GET    | `/api/portfolio/experience`       | Work experience                      |
| GET    | `/api/portfolio/education`        | Education                            |
| GET    | `/api/portfolio/certificates`     | Certificates                         |
| GET    | `/api/portfolio/testimonials`     | Testimonials                         |
| GET    | `/api/portfolio/achievements`     | Achievements                         |
| GET    | `/api/portfolio/social-links`     | Social links                         |
| GET    | `/api/portfolio/blogs`            | Published posts (`?category=`)       |
| GET    | `/api/portfolio/blogs/:slug`      | Single post                          |
| GET    | `/api/portfolio/blog-categories`  | Blog categories                      |
| POST   | `/api/contact`                    | Contact form                         |
| POST   | `/api/visitors`                   | Traffic beacon                       |
| GET    | `/api/download/resume/:id`        | Download the active CV (PDF)         |

### Auth

| Method | Path               | Description                     |
| ------ | ------------------ | ------------------------------- |
| POST   | `/api/auth/login`  | Returns a JWT and the user     |
| GET    | `/api/auth/me`     | Current user (requires token)   |
| POST   | `/api/auth/logout` | Stateless logout                |

### AI assistant

| Method | Path                    | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| GET    | `/api/ai/settings`      | Public assistant configuration      |
| POST   | `/api/ai/chat`          | Send a message, get a reply        |
| GET    | `/api/ai/history`       | Conversation history (`session_id`)|
| DELETE | `/api/ai/history`       | Clear a conversation               |

### Admin (requires `Authorization: Bearer <token>`)

| Method | Path                                     | Description                     |
| ------ | ---------------------------------------- | ------------------------------- |
| GET    | `/api/admin/dashboard`                   | Statistics and recent activity  |
| GET    | `/api/admin/messages`                    | Contact messages                |
| GET    | `/api/admin/messages/:id`                | Open a message (marks it read)  |
| PATCH  | `/api/admin/messages/:id/read`           | Mark a message as read          |
| DELETE | `/api/admin/messages/:id`                | Delete a message                |
| GET    | `/api/admin/resume`                      | Uploaded CV files               |
| POST   | `/api/admin/resume`                      | Upload a CV (multipart)         |
| PATCH  | `/api/admin/resume/:id/activate`         | Activate a CV                   |
| DELETE | `/api/admin/resume/:id`                  | Delete a CV                     |
| GET    | `/api/admin/site-info`                   | Site information                |
| PUT    | `/api/admin/site-info`                   | Update site information          |
| GET    | `/api/admin/ai-settings`                 | AI configuration (keys hidden)  |
| PUT    | `/api/admin/ai-settings`                 | Update the AI configuration     |
| POST   | `/api/admin/upload/image`                | Upload an image (multipart)     |
| POST   | `/api/admin/upload/document`             | Upload a PDF (multipart)        |

Full CRUD (`GET /api/admin/:collection`, `GET /api/admin/:collection/:id`,
`POST`, `PUT /:id`, `DELETE /:id`) is available for `projects`, `skills`,
`services`, `experience`, `education`, `certificates`, `blogs`,
`blog-categories`, `testimonials`, `achievements` and `social-links`.
List endpoints accept `?search=`, `?limit=`, `?skip=` and the collection
specific filters.

## Data model

`src/models/` holds one Mongoose schema per collection plus a shared
`plugins.js` with the soft-delete and key/value helpers.

`deleted_at` is set instead of removing a document, so the public endpoints
(`find({ deleted_at: null })`) never expose removed records.

## Seeding

`scripts/seed.js` upserts the content snapshot in `scripts/seed-data.json`
into MongoDB and creates the admin account from the `ADMIN_*` environment
variables.

```bash
npm run seed        # merge into the existing database
npm run seed:fresh  # drop everything first
```
