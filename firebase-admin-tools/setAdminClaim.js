// setAdminClaim.js
const admin = require('firebase-admin');

// Path to your service account key JSON file
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Replace with your admin users' UIDs
const adminUids = [
  'qaaSNXaed1gKkfXjLGb7ic7DQeq2'
  //, 'UID_FOR_jeevajothy1964'
];

adminUids.forEach(uid => {
  admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
      console.log(`Custom claim 'admin: true' set for UID: ${uid}`);
    })
    .catch(error => {
      console.error('Error setting custom claim:', error);
    });
});