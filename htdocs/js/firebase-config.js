/* ============================================
   BestBuddies Pet Grooming - Firebase Configuration
   Updated to user-provided project config while preserving auth/database exports
   ============================================ */

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Firebase configuration - REPLACE WITH YOUR NEW PROJECT CONFIG
// const firebaseConfig = {
//     apiKey: "AIzaSyA9RyxaUTC1oeazLI6v5xECbKt3K2qVEV4",
//     authDomain: "project-91cc9.firebaseapp.com",
//     databaseURL: "https://project-91cc9-default-rtdb.firebaseio.com",
//     projectId: "project-91cc9",
//     storageBucket: "project-91cc9.firebasestorage.app",
//     messagingSenderId: "677692002376",
//     appId: "1:677692002376:web:6c918e1edcc2702357c87d",
//     measurementId: "G-TMRWS8BXML"
//   };
const firebaseConfig = {
  apiKey: "AIzaSyA8ti55H-TQMxXhKQePaWGaBk1HzBVdYBw",
  authDomain: "new-data-8a3b4.firebaseapp.com",
  databaseURL: "https://new-data-8a3b4-default-rtdb.firebaseio.com",
  projectId: "new-data-8a3b4",
  storageBucket: "new-data-8a3b4.firebasestorage.app",
  messagingSenderId: "28900710454",
  appId: "1:28900710454:web:fe9173e3c5bd3baa3c6097",
  measurementId: "G-H4E2D74D5W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
let database;
try {
  database = getDatabase(app);
} catch (e) {
  console.warn('Realtime Database not configured for this project or getDatabase failed:', e);
  database = null;
}

// Make Firebase services globally available
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDatabase = database;
window.firebaseAnalytics = analytics;

console.log('Firebase initialized with updated config');
