
# 🎬 BrokieFlix

BrokieFlix is a beautiful and fast streaming website powered by React + Vite + TMDb API. It lets you search, watch, and track movies and TV shows — all in one slick interface.

---

## 🧰 Requirements

- ✅ Node.js v18 or later
- ✅ npm (comes with Node)

---

## 🚀 Getting Started (with npm)

### 1. Clone this repo

```bash
git clone https://github.com/your-username/brokieflix.git
cd brokieflix
````

### 2. Install all dependencies

```bash
npm install
```

Thanks! Here's the updated **README.md** section with that clarification added:

---

### ✅ Add Your TMDb API Key

You need a TMDb API key to fetch movie and TV data.

#### 🔹 Option 1: Directly in Code (Recommended for Local Dev)

Open this file:

```
src/services/tmdb.ts
```

Go to **line 2** and replace the placeholder:

```ts
// src/services/tmdb.ts
const TMDB_API_KEY = 'YOUR_ACTUAL_TMDB_API_KEY_HERE';
```

➡️ Paste your real TMDb API key inside the quotes.

> 🔑 Don’t have one? Get it free from [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)


### 4. Run the website locally

```bash
npm install
npx vite
```

Then open your browser and go to:

```
http://localhost:8080
```

---

## 🧪 How It Works

* Search for any **movie** or **TV show**
* Click to play from multiple **streaming sources**
* Watch episodes with the **Next Episode** button
* Choose your stream quality in **Settings**
* Tracks your progress in **Continue Watching**

---

## 🛠 Directory Overview

```
📦 brokieflix/
 ┣ 📁 public/
 ┣ 📁 src/
 ┃ ┣ 📁 components/
 ┃ ┣ App.tsx
 ┃ ┣ main.tsx
 ┣ .env           ← 🌟 Your TMDb key goes here
 ┣ index.html
 ┣ package.json
 ┣ vite.config.ts
```

---



## 🔒 Production Build

To build the site for deployment:

```bash
npm run build
```

You’ll find the optimized site inside the `dist/` folder.

---



## 🙌 Credits

Built by [`@jscreator`](https://github.com/jscreator)
Powered by TMDb, Tailwind CSS, Vite, React, Lucide Icons, and ShadCN UI.

---

