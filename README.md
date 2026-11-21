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
| `ADMIN_SECRET` | Optional long random string used to sign admin sessions. If unset, it's derived from `ADMIN_PASSWORD`. Changing either one logs everyone out. |
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

Uploaded images and PDFs (up to 4 MB each) are stored in MongoDB, so they survive redeploys on hosts with temporary disks.

`npm run seed` adds any built-in projects that are missing from the database. It never overwrites projects you edited in the admin.

## Deploy

The same code deploys to **Vercel**, **Render** or **Railway**. Pick one.

| | Vercel | Render | Railway |
|---|---|---|---|
| How it runs | Static site + the API as a serverless function | One Node server | One Node server |
| Free option | Yes (Hobby), never sleeps | Yes, but sleeps after 15 min idle (~1 min to wake) | Trial credit, then paid |
| Good for | Fastest page loads, free | Simplest setup | Always-on server, simple setup |

### Before you deploy (all hosts)

1. **Merge your branch** into `main` on GitHub (or pick your branch during setup).
2. **Let the host reach MongoDB Atlas.** Cloud hosts don't have fixed IP addresses, so in Atlas go to **Network Access → Add IP Address → Allow access from anywhere** (`0.0.0.0/0`). Your database user and password still protect it.
3. **Have your environment variables ready.** You'll paste them into the host's dashboard, since `.env` is never uploaded:
   - `MONGODB_URI`: required
   - `ADMIN_PASSWORD`: required for `/admin`. Use a long, unique password.
   - `ADMIN_SECRET`: recommended, any long random string
   - `OPENAI_API_KEY`, `OPENAI_MODEL`, `FORMSPREE_ENDPOINT`: optional
   - Don't set `PORT` (the host sets it), `CLIENT_ORIGIN`, or `MONGODB_DNS_SERVERS`.

### Vercel

1. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and **import** `yash-kumar-roy/yashkumarroy`.
2. Leave the build settings as they are. They come from `vercel.json`: Vite build into `dist/`, demos copied to `dist/demos/`, and `api/index.js` serving every `/api/*` request.
3. Open **Environment Variables** and add the variables listed above.
4. Click **Deploy**. When it finishes, open `https://<your-project>.vercel.app/api/status` and check that `"connected": true`.

Notes: the first API request after a quiet period takes a second or two longer while the function starts and connects to MongoDB. Uploads are limited to 4 MB, Vercel's request size limit.

### Render

1. In [Render](https://dashboard.render.com), choose **New → Web Service** and connect the repository.
2. Settings:
   - Runtime: **Node**
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
3. Add the environment variables, then **Create Web Service**. Your site will be at `https://<name>.onrender.com`.

### Railway

1. In [Railway](https://railway.com), choose **New Project → Deploy from GitHub repo** and pick the repository. It detects Node automatically and runs `npm run build`, then `npm start`.
2. Under **Variables**, add the environment variables.
3. Under **Settings → Networking**, click **Generate Domain** to get a public URL.

### After deploying

- Open `/admin` on the live site and log in with `ADMIN_PASSWORD`.
- To use your own domain, add it in the host's **Domains** settings and follow the DNS instructions it shows.
- Every push to the connected branch redeploys automatically.

## Project structure

```
api/index.js               Vercel serverless entry (wraps server/app.js)
vercel.json                Vercel build settings and URL rewrites
scripts/copy-demos.js      Copies the demo apps into dist/demos/ during `npm run build`
server/
  app.js                   Express app: API, /demos static hosting, built SPA, chat endpoint
  index.js                 Starts app.js as a normal server (local, Render, Railway)
  data/demos.js            Demo slug → folder list
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
