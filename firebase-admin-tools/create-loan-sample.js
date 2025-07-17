const admin = require('firebase-admin');
const path = require('path');

// Path to your service account key
const serviceAccount = require(path.resolve(__dirname, './serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createLoanSample() {
  const loanData = {
    loanName: "Sample SHG Loan",
    loanPurpose: "Personal",
    borrowerIds: ["sampleBorrowerId1", "sampleBorrowerId2"],
    totalAmount: 40000,
    totalEmis: 40,
    emiAmount: 1000,
    loanBank: "HDFC",
    loanAccountNumber: "1234567890",
    startDate: "2024-07-08T00:00:00.000Z",
    endDate: "2027-07-08T00:00:00.000Z",
    status: "active",
    interestRate: 0,
    remainingAmount: 0,
    paidAmount: 0,
    paidEmis: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    // Add any other fields your app expects
  };

  // Add to 'loans' collection
  const docRef = await db.collection('loans').add(loanData);
  console.log('Sample loan created with ID:', docRef.id);
}

createLoanSample()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error creating loan sample:', err);
    process.exit(1);
  });