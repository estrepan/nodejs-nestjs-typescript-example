import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config';
import { Firebase, Hubspot, StripeConstructor, Facebook } from './integrations';
import { AuthGuard } from './auth';
import { MailerService } from './services';
import { AuthService } from './modules/auth/services';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    AuthModule,
  ],
  providers: [
    AuthGuard,
    ConfigService,
    AuthService,
    MailerService,
    Firebase,
    Hubspot,
    StripeConstructor,
    Facebook,
  ],
})
export class AppModule { }
