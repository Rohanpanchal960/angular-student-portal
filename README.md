# 🎓 EduPortal - Enterprise Student Management System

A production-grade, university-level **Student Management System** architected with **Angular 18** (standalone components, signals, modern `@if` / `@for` control flow, lazy-loaded routes) and **Firebase Modular SDK** (`firebase/auth`, `firebase/firestore`). Designed for seamless deployment on **Vercel**.

---

## 🚀 Key Highlights & Architecture

- **Angular 18 Standalone Architecture**: 100% standalone components, functional guards, and reactive Angular Signals.
- **Role-Based Access Control (RBAC)**: Strict role demarcation for **Admin**, **Faculty**, and **Student** with dedicated navigation and security guards.
- **Approval Workflow**: Students are automatically approved upon registration; Faculty members require Administrator verification before gaining access.
- **Glassmorphic Indigo-Violet Design System**: CSS variable-based styling with dynamic light/dark theme switching, mobile drawer navigation (<860px), and horizontal scrolling data containers.
- **Instant Demo Resiliency**: Runs out-of-the-box with persistent local fallback or seamlessly connects to live Google Firebase Firestore.
- **Printable Document Generation**: Client-side vector PDF generation for **Semester Marksheets** and **Official Exam Admit Cards** via `jspdf` & `jspdf-autotable`.

---

## 🔑 Demo Login Credentials (Quick Test)

You can use the one-click **Quick Demo Fill** buttons on the Login page or use the following credentials:

| Role | Email Address | Password | Account Status | Access Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@eduportal.com` | `admin123` | Active & Approved | Full system access, User CRUD, Course setup, Results publishing |
| **Approved Faculty** | `arvind.sharma@eduportal.com` | `faculty123` | Active & Approved | Attendance register, Assessments, Marks entry grid |
| **Pending Faculty** | `rajesh.verma@eduportal.com` | `faculty123` | **Pending Approval** | Routed to "Awaiting Approval" screen until Admin approves |
| **Student** | `rahul.sharma@eduportal.com` | `student123` | Active & Approved | Progress rings, Marksheet download, Exam hall ticket |

---

## 🛠️ Step-by-Step Setup & Local Development

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24)
- **NPM**: v9.0.0 or higher

### 2. Install Dependencies
```bash
cd student-portal
npm install
```

### 3. Run Development Server
```bash
npm start
# or
ng serve
```
Visit `http://localhost:4200` in your web browser.

### 4. Build for Production
```bash
npm run build
```
Build output is generated in `dist/student-portal/browser/`.

---

## 🌱 Seeding Demo Data

EduPortal automatically seeds the initial database on the very first launch if no users exist. You can also re-seed anytime:
1. **Via the User Interface**: Click the **"Seed Demo Data"** button in the top navigation bar.
2. **Via Command Line**:
   ```bash
   npm run seed
   ```

---

## 🔥 Firebase Configuration & Security Rules

### Step 1: Create Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named `eduportal-student-mgmt`.
3. Enable **Email/Password** authentication in **Authentication > Sign-in method**.
4. Create a **Cloud Firestore** database in production mode.

### Step 2: Configure Environment Keys
Open `src/environments/environment.ts` and paste your web application keys:
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

### Step 3: Deploy Firestore Security Rules
Deploy the included [`firestore.rules`](file:///Users/rohanpanchal/Documents/Angular%20Project/student-portal/firestore.rules):
```bash
firebase deploy --only firestore:rules
```
Or paste the contents of `firestore.rules` directly into **Firebase Console > Firestore Database > Rules**.

### Step 4: Deploy Firestore Indexes
Deploy the composite indexes defined in [`firestore.indexes.json`](file:///Users/rohanpanchal/Documents/Angular%20Project/student-portal/firestore.indexes.json):
```bash
firebase deploy --only firestore:indexes
```

---

## ☁️ Deploying to Vercel

EduPortal includes a pre-configured [`vercel.json`](file:///Users/rohanpanchal/Documents/Angular%20Project/student-portal/vercel.json) with SPA client routing rewrites.

### Deployment Steps:
1. Push your project to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your repository and configure settings:
   - **Framework Preset**: Angular
   - **Root Directory**: `student-portal`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/student-portal/browser`
4. Click **Deploy**. Vercel will build and serve your app globally on its Edge network.

---

## 📂 Project Directory Structure

```
student-portal/
├── firestore.rules                   # Strict Firestore RBAC security rules
├── firestore.indexes.json            # Composite query indexes
├── vercel.json                       # Vercel SPA routing rewrite config
├── scripts/
│   └── seed-data.mjs                 # Standalone database seed script
└── src/
    ├── environments/                 # Development and Production API keys
    ├── styles.css                    # Design system tokens and responsive styles
    └── app/
        ├── core/                     # Core layer
        │   ├── models/               # Master TypeScript models & contracts
        │   ├── services/             # Firebase, Auth, Firestore, Toast, Seed
        │   └── guards/               # Role-based functional route guards
        ├── shared/                   # Shared UI Components
        │   ├── components/navbar/    # Header with theme toggle & user pill
        │   ├── components/sidebar/   # Mobile off-canvas drawer navigation
        │   ├── components/toast/     # Reactive notifications overlay
        │   ├── components/stat-card/ # Analytical metric display cards
        │   └── components/confirm-modal/ # Destructive action dialogs
        └── features/                 # Modular feature domains
            ├── auth/                 # Login, Register, Forgot Password, Profile
            ├── admin/                # Dashboard, Users, Students, Courses, Exams, Results, Reports
            ├── faculty/              # Dashboard, Attendance, Assessments/Marks, Students, Notices
            └── student/              # Dashboard, Progress Rings, Marksheet PDF, Admit Card PDF
```

---

## 🇮🇳 Database & Architecture Hindi Documentation

- **Users Collection (`users`)**:
  - `role`: 'admin' | 'faculty' | 'student'
  - Student registration auto-approve hoti hai (`approved: true`).
  - Faculty registration admin approval ke liye pending hoti hai (`approved: false`).
  - Koi bhi user khud ko admin ke roop me register nahi kar sakta.
- **Attendance Collection (`attendance`)**:
  - Document ID format: `${subjectId}_${date}_${studentId}` (taki duplicate attendance save na ho sake).
  - Students sirf apni attendance dekh sakte hain.
- **Marks Collection (`marks`)**:
  - Document ID format: `${assessmentId}_${studentId}`.
  - `published`: boolean flag hota hai. Jab faculty ya admin results publish karta hai tabhi students ko grades dikhte hain.
- **Results Collection (`results`)**:
  - Semester SGPA, Total Credits, aur Pass/Fail status generate karta hai aur PDF format me download karne ki suvidha deta hai.
- **Security Rules**:
  - Role escalation blocked hai (koi student ya faculty apna role update karke admin nahi ban sakta).
