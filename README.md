# PsychoFlow — Setup Guide

## 📁 Project Structure
```
psychoflow/
├── theme.css              ← Shared design system (all pages use this)
├── index.html             ← Dashboard
├── login.html
├── register.html
├── forgot_password.html
├── contribution.html
├── statistics.html
├── recepients.html        ← Support requests listing
├── recepeintsdet.html     ← Register support request form
├── management.html        ← NEW: Donors / Recipients / Allocations
├── luna.html              ← Luna AI chat
└── backend/
    ├── server.js          ← Express API
    ├── package.json
    ├── .env.example       ← Copy to .env and fill in credentials
    └── schema.sql         ← Supabase database schema
```

---

## 🗄️ 1. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Create a new **Project** (choose a region close to your users, e.g. East Africa).
3. In your project dashboard, go to **SQL Editor** → click **New query**.
4. Paste the entire contents of `backend/schema.sql` and click **Run**.
5. Tables `donors`, `recipients`, and `allocations` will be created.

### Get your credentials
- Go to **Project Settings** → **API**.
- Copy **Project URL** → `SUPABASE_URL`
- Copy **anon / public** key → `SUPABASE_ANON_KEY`

---

## ⚙️ 2. Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3001
```

---

## 🚀 3. Run the Backend

```bash
cd backend
npm install
npm start
# or for development with auto-reload:
npm run dev
```

The API will be available at `http://localhost:3001`.

### API Endpoints

| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| GET    | /api/donors           | List all donors               |
| POST   | /api/donors           | Add a donor                   |
| DELETE | /api/donors/:id       | Delete a donor                |
| GET    | /api/recipients       | List all recipients           |
| POST   | /api/recipients       | Add a recipient               |
| DELETE | /api/recipients/:id   | Delete a recipient            |
| GET    | /api/allocations      | List allocations (with joins) |
| POST   | /api/allocations      | Record a fund allocation      |
| DELETE | /api/allocations/:id  | Delete an allocation          |
| GET    | /api/summary          | Get total donated/distributed |

---

## 🌐 4. Connect Frontend to Backend (Optional)

The `management.html` page currently uses **localStorage** for instant demo use.  
To switch it to the real API, replace the `save()` / `renderXxx()` functions to use `fetch`:

```javascript
// Example: fetch donors from backend
const res = await fetch('http://localhost:3001/api/donors');
const donors = await res.json();
```

---

## 🎨 5. Theme

All pages import `theme.css`. The gradient palette is:
`#FAE508 → #DFB6B2 → #824D69 → #522959 → #2A11B4 → #180018`

CSS variables are defined in `:root` in `theme.css` — change them there to restyle everything.

---

## 🤖 6. Luna AI

Luna uses the [Groq API](https://console.groq.com). The key in `luna.html` is pre-configured.  
To use your own key, replace `GROQ_API_KEY` in `luna.html`.