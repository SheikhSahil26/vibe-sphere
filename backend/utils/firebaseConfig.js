// firebaseConfig.js
const firebase = require('firebase-admin');

const serviceAccountPath = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
const databaseURL = process.env.FIREBASE_DATABASE_URL;


// Initialize Firebase
firebase.initializeApp({ 
    credential: firebase.credential.cert(serviceAccountPath),
    databaseURL: databaseURL
});

// Export the database
const database = firebase.database();
module.exports = database;
