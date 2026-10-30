# Kota Stranger Tourism — setup
1. `js/config.js` me WhatsApp number + Firebase config bharo.
2. Firebase Console: Authentication > Email/Password ON, ek admin user banao. Firestore Database create karo.
3. Firestore Rules:
```
rules_version = '2';
service cloud.firestore { match /databases/{db}/documents {
  match /trips/{id}   { allow read: if true; allow write: if request.auth != null; }
  match /reviews/{id} { allow read: if true; allow write: if request.auth != null; }
  match /enquiries/{id} { allow create: if true; allow read, update, delete: if request.auth != null; }
}}
```
4. GitHub par push karo, Vercel se deploy. Admin: `/admin/`
