# 🚀 Deployment Guide: Student Management System (Experiment 28)

Ye document step-by-step explain karta hai ki is Angular project ko **Netlify** ya **GitHub Pages** par kaise live deploy karein.

---

## 🛠️ Step 1: Production Build Generate Karein

Angular project ko optimize, minify aur production-ready bundle banane ke liye CLI command run karein:

```bash
# student-portal directory ke andar:
npm run build
```

Ye command Angular Application ko compile karke `dist/student-portal/browser/` folder me output file banayegi.

---

## 🌐 Option A: Netlify par Instant Deploy (Recommended & Fastest)

### Method 1: Netlify Drag & Drop (Bina kisi setup ke 1 minute me)
1. Browser me open karein: [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Login / Sign up karein.
3. Apne computer me `student-portal/dist/student-portal/browser` folder ko drag karke Netlify box me drop kar dein.
4. **Done!** Netlify aapko live public link (jaise `https://student-portal-xyz.netlify.app`) provide karega.

### Method 2: Git Repository se Connect Karke
1. Apne project ko GitHub par push karein:
   ```bash
   git init
   git add .
   git commit -m "Complete Student Management System"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Netlify dashboard me **"Add new site" -> "Import an existing project"** par click karein.
3. GitHub repository select karein.
4. Build Settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/student-portal/browser`
5. Netlify me automatically `netlify.toml` file read hogi jisse Angular SPA route redirects handle ho jayenge. Click **"Deploy"**.

---

## 🐙 Option B: GitHub Pages par Deploy

1. Angular CLI ka automated GitHub Pages package install karein:
   ```bash
   npx angular-cli-ghpages --dir=dist/student-portal/browser
   ```
2. GitHub Repository Settings -> **Pages** tab me jakar `gh-pages` branch ko select karein.
3. 2 minute me aapki site `https://<your-username>.github.io/<repo-name>/` par live ho jaayegi!

---

## 📋 Syllabus Experiment 28 Verification Checklist
- [x] Application successfully builds via `ng build` without compilation errors.
- [x] Routing fallback redirects configured in `netlify.toml` (`/* -> /index.html 200`).
- [x] Assets and Google Fonts are bundled and linked with HTTPS.
- [x] LocalStorage persistence verified for offline/live demo functionality.
