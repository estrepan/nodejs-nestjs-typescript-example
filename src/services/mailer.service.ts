import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { MailOptionsWithTo, MailOptionsWithToUids, Email, EmailTemplate } from '../interfaces';
import { Firebase } from '../integrations';
import { EmailTemplateEnum } from '../enums';

@Injectable()
export class MailerService {
  constructor(
    @Inject(forwardRef(() => Firebase)) private firebase: Firebase,
  ) { }

  public async sendMail(options: MailOptionsWithTo | MailOptionsWithToUids): Promise<Email | void> {
    const [projectTemplate, defaultTemplate]: EmailTemplate[] = await Promise.all([
      this.firebase.admin.firestore()
        .collection('emailTemplates')
        .where('name', '==', options.projectId + '-' + options.template)
        .get()
        .then(async (templates: admin.firestore.QuerySnapshot) =>
          !templates.empty ? templates.docs[0].data() as EmailTemplate : undefined,
        ),
      this.firebase.admin.firestore()
        .collection('emailTemplates')
        .where('name', '==', options.template)
        .get()
        .then(async (templates: admin.firestore.QuerySnapshot) =>
          !templates.empty ? templates.docs[0].data() as EmailTemplate : undefined,
        ),
    ]);

    if (projectTemplate) {
      return this.sending(projectTemplate.name, options);
    }

    Logger.warn(`Email template '${ options.projectId + '-' + options.template }' is missing.`);

    if (defaultTemplate) {
      return this.sending(defaultTemplate.name, options);
    }

    Logger.error(`Default email template '${ options.template }' is missing.`);
  }

  private async sending(template: EmailTemplateEnum, options: MailOptionsWithTo | MailOptionsWithToUids): Promise<Email> {
    return  this.firebase.admin.firestore()
      .collection('emails')
      .add({
        projectId: options.projectId,
        template: {
          data: options.data,
          name: template,
        },
        to: ('to' in options && options.to) || null,
        toUids: ('toUids' in options && options?.toUids) || null,
      });
  }
}
