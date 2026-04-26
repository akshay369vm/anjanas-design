# Anjana's Design — Firebase Setup & Admin Guide

## 🏗️ Architecture

- **Frontend**: Pure HTML/CSS/JS with Tailwind CSS
- **Database**: Cloud Firestore (NoSQL)
- **Authentication**: Firebase Auth (Email/Password)
- **Image Hosting**: ImgBB (free image upload API)
- **Hosting**: GitHub Pages or Netlify (Static files)

---

## 🔥 Firebase Setup (Step-by-Step)

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: `anjanas-design`

### 2. Register a Web App
1. Click the **Web icon** (`</>`)
2. App nickname: `Anjanas Design Web`
3. Click **Register app**
4. Copy the `firebaseConfig` object.

### 3. Enable Authentication
1. Go to **Build → Authentication → Sign-in method**
2. Click **Email/Password** → Enable it → Save
3. Go to the **Users** tab → **Add user** (e.g., `admin@example.com`)

### 4. Set Up Cloud Firestore
1. Go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode**.

### 5. Configure Firestore Security Rules
Go to **Firestore → Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Update Config in Code
Open both `js/firebase-config.js` and `js/main.js` and replace the placeholders with your actual Firebase config.

---

## 🖼️ ImgBB Setup (Image Hosting)
1. Go to [api.imgbb.com](https://api.imgbb.com) and get a free **API key**.
2. Update `js/firebase-config.js`:
   ```js
   export const IMGBB_API_KEY = "your_key_here";
   ```

---

## 🛠️ Admin Portal
Navigate to: `admin.html` to manage your products and orders.

### Managing Products
- **Vishu Collection**: Set category to `vishu`
- **Onam Collection**: Set category to `onam`
- **Other**: `budget-love`, `luxury-love`, etc.

---

## 📁 Project File Structure
- `index.html`: Main home page
- `vishu.html`: Vishu collection (dynamic)
- `onam.html`: Onam collection (dynamic)
- `admin.html`: Dashboard
- `js/firebase-config.js`: Shared keys
- `js/main.js`: Public site logic
- `js/admin.js`: Dashboard logic
- `css/admin.css`: Dashboard styles
