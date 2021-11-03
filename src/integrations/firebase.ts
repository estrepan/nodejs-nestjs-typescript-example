import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import firebase from 'firebase';
import * as path from 'path';

@Injectable()
export class Firebase {
  public admin: admin.app.App;
  public app: firebase.app.App;
  public firestore: firebase.firestore.Firestore;

  constructor(@Inject(forwardRef(() => ConfigService)) private readonly configService: ConfigService) {
    const firebaseAdminConfig: admin.AppOptions = {
      credential: admin.credential.applicationDefault(),
      databaseURL: this.configService.get('firebase.databaseUrl'),
    };

    if (this.configService.get('firebase.serviceAccountKey')) {
      firebaseAdminConfig.credential = admin.credential.cert(JSON.parse(this.configService.get('firebase.serviceAccountKey')));
    } else {
      firebaseAdminConfig.credential = admin.credential.cert(require(path.resolve(this.configService.get('firebase.serviceAccountKeyPath'))));
    }

    const firebaseConfig: object = {
      apiKey: this.configService.get('firebase.apiKey'),
      appId: this.configService.get('firebase.appId'),
      authDomain: this.configService.get('firebase.authDomain'),
      databaseURL: this.configService.get('firebase.databaseUrl'),
      projectId: this.configService.get('firebase.projectId'),
    };

    if (admin.apps.length === 0) {
      this.admin = admin.initializeApp(firebaseAdminConfig);
      this.admin.firestore().settings({ ignoreUndefinedProperties: true });
      this.app = firebase.initializeApp(firebaseConfig);
    } else {
      this.admin = admin.initializeApp(firebaseAdminConfig, `app-${Math.random().toString(36).substring(7)}`);
      this.admin.firestore().settings({ ignoreUndefinedProperties: true });
      this.app = firebase.initializeApp(firebaseConfig, `app-${Math.random().toString(36).substring(7)}`);
    }
    this.firestore = this.app.firestore();
  }
}
