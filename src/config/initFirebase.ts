import admin from "firebase-admin";
const serviceAccount = require("../../firebaseServiceAccount.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

export default admin;