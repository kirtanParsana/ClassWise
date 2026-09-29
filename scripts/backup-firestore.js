require('dotenv').config();

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Missing Firebase Admin credentials in .env');
}

initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = getFirestore();

const collections = [
  'courses',
  'faculties',
  'rooms',
  'schedules',
  'sections',
  'timeslots',
  'timetables',
  'users',
];

const backupDir = path.join(process.cwd(), 'backups', 'firestore');

function serialize(value) {
  if (value === null || value === undefined) return value;

  if (value instanceof Date) {
    return {
      __type: 'timestamp',
      value: value.toISOString(),
    };
  }

  if (typeof value.toDate === 'function') {
    return {
      __type: 'timestamp',
      value: value.toDate().toISOString(),
    };
  }

  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  if (typeof value === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = serialize(val);
    }
    return result;
  }

  return value;
}

async function backupCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();

  const documents = snapshot.docs.map((doc) => ({
    id: doc.id,
    data: serialize(doc.data()),
  }));

  const outputPath = path.join(backupDir, `${collectionName}.json`);

  fs.writeFileSync(
    outputPath,
    JSON.stringify(documents, null, 2),
    'utf8'
  );

  console.log(
    `✓ ${collectionName}: ${documents.length} documents → ${outputPath}`
  );

  return documents.length;
}

async function main() {
  fs.mkdirSync(backupDir, { recursive: true });

  console.log('======================================');
  console.log('ClassWise Firestore Backup');
  console.log(`Project: ${projectId}`);
  console.log('======================================\n');

  let totalDocuments = 0;

  for (const collection of collections) {
    totalDocuments += await backupCollection(collection);
  }

  const metadata = {
    projectId,
    createdAt: new Date().toISOString(),
    collections,
    totalDocuments,
  };

  fs.writeFileSync(
    path.join(backupDir, 'backup-metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf8'
  );

  console.log('\n======================================');
  console.log(`Backup complete: ${totalDocuments} documents`);
  console.log(`Location: ${backupDir}`);
  console.log('======================================');
}

main().catch((error) => {
  console.error('\nBackup failed:');
  console.error(error);
  process.exit(1);
});
