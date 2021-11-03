import { Change, CloudFunction, EventContext, firestore } from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();
let app: admin.app.App;

if (admin.apps.length === 0) {
  app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  app.firestore().settings({ ignoreUndefinedProperties: true });
} else {
  app = admin.initializeApp(
    {
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    },
    `app-${Math.random().toString(36).substring(7)}`,
  );
  app.firestore().settings({ ignoreUndefinedProperties: true });
}

export function eventTrigger(
  eventType: string,
  document: string,
  handler: (
    change: Change<any> | admin.firestore.QueryDocumentSnapshot,
    context: EventContext,
    firebaseAdmin,
  ) => Promise<any> | any,
): CloudFunction<Change<any>> {
  try {
    return firestore.document(document)[eventType]((
      snapshot: admin.firestore.QueryDocumentSnapshot, context: EventContext) => handler(snapshot, context, app)
    );
  } catch (e) {
    throw new Error(`Path: ${ document }. Message: ${ e.message }. Stack: ${ e.stack }`);
  }
}
