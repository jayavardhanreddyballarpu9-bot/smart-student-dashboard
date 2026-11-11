# Smart Student Life Dashboard

A modern, responsive React + Vite single-page application to help students manage their academic life — all data saved locally in your browser.

## ✨ Features

| Feature | What you can do |
|---------|----------------|
| **Dashboard** | At-a-glance overview: pending tasks, GPA, class count, notes |
| **Tasks & Assignments** | Full CRUD with priority, due dates, subjects, search & filters |
| **Weekly Schedule** | 7-day timetable grid — add/edit/delete class slots with colors |
| **Grade Tracker** | Add courses, log individual assignment grades, weighted average & GPA |
| **Notes** | Card-based notes with tags, colors, full-text search & tag filter |

## 🛠️ Tech Stack

- **React 19** — UI library
- **Vite 8** — build tool (dev server + production build)
- **React Router v7** — client-side routing
- **Tailwind CSS v4** — utility-first styling
- **Lucide React** — icon set
- **localStorage** — zero-backend persistence

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/smart-student-dashboard.git
cd smart-student-dashboard

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open http://localhost:5173 in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Create optimised production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint linter |

## 📁 Project Structure

```
smart-student-dashboard/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Layout.jsx        # App shell: header + sidebar outlet
│   │   ├── Sidebar.jsx       # Responsive navigation sidebar
│   │   └── Modal.jsx         # Reusable modal dialog
│   ├── hooks/
│   │   └── useLocalStorage.js  # Persistent state hook
│   ├── pages/
│   │   ├── Dashboard.jsx     # Overview page
│   │   ├── Tasks.jsx         # Task / assignment manager
│   │   ├── Schedule.jsx      # Weekly timetable
│   │   ├── Grades.jsx        # Grade tracker
│   │   └── Notes.jsx         # Note-taking
│   ├── utils/
│   │   └── helpers.js        # Shared utilities & constants
│   ├── App.jsx               # Router configuration
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles (Tailwind import)
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🌐 Deploy to GitHub Pages

```bash
# 1. Install gh-pages
npm install -D gh-pages

# 2. Add to package.json scripts:
#    "predeploy": "npm run build",
#    "deploy": "gh-pages -d dist"
# And add: "homepage": "https://YOUR_USERNAME.github.io/smart-student-dashboard"

# 3. Deploy
npm run deploy
```

## 🗂️ Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Smart Student Life Dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smart-student-dashboard.git
git push -u origin main
```

## 💾 Data Storage

All data is stored in your browser's `localStorage` under these keys:

| Key | Contents |
|-----|----------|
| `ssd_tasks` | Tasks & assignments array |
| `ssd_schedule` | Weekly class slots array |
| `ssd_courses` | Courses with nested grade entries |
| `ssd_notes` | Notes array |

> Data persists across page refreshes but is local to the browser. Clearing site data will reset everything.

## 📱 Responsive Design

- **Mobile** (< 1024px): Sidebar hidden by default, accessible via ☰ menu button
- **Tablet / Desktop** (≥ 1024px): Sidebar always visible

## 📄 License

MIT
