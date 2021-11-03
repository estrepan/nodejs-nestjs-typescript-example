import axios, { AxiosResponse } from 'axios';
import { InternalServerErrorException } from '@nestjs/common';

export class Facebook {
  private readonly host: string;

  constructor() {
    this.host = 'https://graph.facebook.com/v11.0';
  }

  public async api(apiPath: string, oauthAccessToken: string): Promise<AxiosResponse> {
    return axios.get(`${ this.host }${ apiPath }?access_token=${ oauthAccessToken }`)
      .catch((err: Error) => {
        throw new InternalServerErrorException(err);
      });
  }
}
