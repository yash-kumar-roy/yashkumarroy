# Yash Kumar Roy — Portfolio (MERN)

A recruiter-focused portfolio for a Data Science Associate and full-stack developer, with a built-in admin dashboard for editing everything without touching code.

- **Public site:** one scrolling page with the hero (an interactive ROC curve of the churn model), selected case studies, a searchable archive of all projects, experience and education, skills, about, writing, and contact. Each project and post also has its own page.
- **Admin dashboard** at `/admin`: edit your profile, experience, skills, photo and résumé; add or edit projects and their image galleries; write and publish blog posts in Markdown; read contact messages.
- **16 playable demos** (the folders in the repo root) served under `/demos/*`, which open in a pop-up or run as live previews.

---

## Run it locally

Run every command from the project root (the folder containing `package.json`).

```bash
npm install
npm run dev
```

Open http://localhost:5173. The Express API runs on port 3001, and Vite passes `/api` and `/demos` requests through to it.

To run it the way it would run in production (one server on port 3001):

```bash
npm run build
npm start
```

## Configuration (`.env`)

Copy `.env.example` to `.env` and fill in what you need:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string. Without it the site shows the built-in data, and the admin can't save. |
| `MONGODB_DB_NAME` | Database name if the URI doesn't include one (default `portfolio`). |
| `MONGODB_DNS_SERVERS` | e.g. `1.1.1.1,8.8.8.8`. Fixes `querySrv ECONNREFUSED` on some Windows setups. The server also retries with these automatically. |
| `ADMIN_PASSWORD` | **Turns on `/admin`.** The password you log in with. |
| `ADMIN_SECRET` | Optional random string so admin sessions survive restarts. |
| `ADMIN_TOKEN` | Optional static token for scripts (`Authorization: Bearer …`). |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Optional. Powers the "Ask about my work" chat assistant. |
| `FORMSPREE_ENDPOINT` | Optional. Also forwards contact messages to your email. |
| `CLIENT_ORIGIN` | Optional comma-separated CORS allow-list. |
| `PORT` | API port (default 3001). If you change it, update `vite.config.js` too. |

## Using the admin dashboard

1. Add `ADMIN_PASSWORD=choose-a-strong-password` to `.env` and restart the server.
2. Go to http://localhost:5173/admin and log in. Sessions last 12 hours.
3. Tabs:
   - **Profile:** headline, summary, availability, About paragraphs, portrait, résumé PDF, social links, the hero ROC-AUC score, work experience (with achievements and tools), education, and skill groups.
   - **Projects:** create, edit or delete projects. Upload several images: the first one is the cover on the home page, and all of them appear as a gallery on the project page. Tick **Feature on the home page** to give a project a large case-study row, and add a **Headline result** (e.g. "ROC-AUC 0.89 on holdout data").
   - **Blog:** write in Markdown with a live preview, insert images, then save as a draft or publish. Once at least one post is published, a Writing section and nav link appear.
   - **Messages:** read and delete contact-form submissions.

Uploaded images and PDFs (up to 5 MB each) are stored in MongoDB, so they survive redeploys on hosts with temporary disks.

`npm run seed` adds any built-in projects that are missing from the database. It never overwrites projects you edited in the admin.

## Project structure

```
server/
  index.js                 Express app: API, /demos static hosting, built SPA, chat endpoint
  config/db.js             MongoDB connection (DNS fallback, auto-seed, backfills)
  middleware/requireAdmin.js  Password login, signed session tokens, rate limiting
  models/                  Project, Profile, Blog, Media, Contact
  routes/                  projects, profile, blogs, media, contact, admin
  data/                    Built-in projects + default profile (also used by the frontend as fallback)
src/
  pages/                   Home, ProjectDetail, Blog
  components/              RocCurve, FeaturedProject, ProjectArchive, Skills, Experience, ContactSection…
  admin/                   Dashboard (lazy-loaded, so visitors never download it)
  lib/                     API client, site data context, scroll-reveal hook
  styles.css               Design tokens and site styles
```

## API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/profile` | | Profile (database or defaults) |
| `PUT` | `/api/profile` | admin | Update profile |
| `GET` | `/api/projects` | | Projects (`?category=`, `?search=`, `?featured=true`) |
| `GET` | `/api/projects/:slug` | | One project |
| `POST` / `PUT` / `DELETE` | `/api/projects[/:id]` | admin | Create / update / delete |
| `POST` | `/api/projects/seed` | admin | Insert missing built-in projects |
| `GET` | `/api/blogs` | | Published posts (`?all=true` with admin includes drafts) |
| `GET` | `/api/blogs/:slug` | | One post (drafts are admin-only) |
| `POST` / `PUT` / `DELETE` | `/api/blogs[/:id]` | admin | Create / update / delete |
| `POST` | `/api/media` | admin | Upload an image or PDF (`multipart/form-data`, field `file`) |
| `GET` | `/api/media/:id` | | Serve an uploaded file |
| `POST` | `/api/contact` | | Send a contact message |
| `GET` / `DELETE` | `/api/contact[/:id]` | admin | List / delete messages |
| `POST` | `/api/admin/login` | | `{ password }` → session token |
| `GET` | `/api/admin/me` | | Session status |
| `POST` | `/api/chat` | | AI assistant |
| `GET` | `/api/status` | | Server and database status |
