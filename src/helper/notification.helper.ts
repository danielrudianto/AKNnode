import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as data from "../serviceAccount.json";

admin.initializeApp({
  credential: admin.credential.cert(data as ServiceAccount)
});

export default admin;