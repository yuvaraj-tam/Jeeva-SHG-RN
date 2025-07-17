// Usage: node migrate-payments-borrowerId.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migratePayments() {
  const paymentsSnapshot = await db.collection('payments').get();
  let updated = 0;
  let skipped = 0;
  for (const doc of paymentsSnapshot.docs) {
    const payment = doc.data();
    if (payment.borrowerId) continue; // Already migrated
    const loanRef = db.collection('loans').doc(payment.loanId);
    const loanSnap = await loanRef.get();
    if (!loanSnap.exists) {
      console.warn(`Loan not found for payment ${doc.id}`);
      skipped++;
      continue;
    }
    const loan = loanSnap.data();
    if (!loan.borrowerIds || loan.borrowerIds.length === 0) {
      console.warn(`No borrowers for loan ${payment.loanId} (payment ${doc.id})`);
      skipped++;
      continue;
    }
    if (loan.borrowerIds.length === 1) {
      // Safe to assign
      await doc.ref.update({ borrowerId: loan.borrowerIds[0] });
      updated++;
      console.log(`Updated payment ${doc.id} with borrowerId ${loan.borrowerIds[0]}`);
    } else {
      // Ambiguous, skip and log
      console.warn(`Multiple borrowers for loan ${payment.loanId} (payment ${doc.id}), manual review needed.`);
      skipped++;
    }
  }
  console.log(`Migration complete. Updated: ${updated}, Skipped: ${skipped}`);
}

migratePayments().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 