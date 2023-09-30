import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor() {
    // Inicializa Firebase Admin con tu archivo de credenciales
    const serviceAccount = require('../../firebase-credentials.json');

    if (!admin.apps.length) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      this.firebaseApp = admin.app();
    }
  }

  async sendNotification(token: string, title: string, body: string) {
    const message: admin.messaging.Message = {
      notification: {
        title: title,
        body: body,
      },
      token: token,
    };

    try {
      const response = await this.firebaseApp.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      throw error;
    }
  }
}
