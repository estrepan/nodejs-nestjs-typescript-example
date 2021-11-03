import { forwardRef, Inject, Injectable } from '@nestjs/common';
import HubspotClient from 'hubspot';
import { ConfigService } from '@nestjs/config';
import { RequestPromise } from 'request-promise';

@Injectable()
export class Hubspot {
  private client: HubspotClient;

  constructor(
    @Inject(forwardRef(() => ConfigService)) private readonly configService: ConfigService,
  ) {
    this.client = new HubspotClient({
      apiKey: this.configService.get('hubspot.apiKey'),
    });
  }

  public async getContact(email: string): RequestPromise {
    return this.client.contacts.getByEmail(email);
  }

  public async getContacts(options?: Record<string, unknown>): RequestPromise {
    return this.client.contacts.getAll(options);
  }

  public async getCompanies(): RequestPromise {
    return this.client.companies.get();
  }

  public async createOrUpdateContact(user: any): Promise<any> {
    const properties: any[] = [
      { property: 'firstname', value: user.first_name },
      { property: 'lastname', value: user.last_name },
      { property: 'email', value: user.email },
    ];

    return this.client.contacts.createOrUpdate(user.email, { properties });
  }
}
