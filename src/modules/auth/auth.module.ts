import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from '../../config';
import { AuthController } from './controllers';
import { AuthGuard } from '../../auth';
import { Firebase, Hubspot, Google, StripeConstructor, Facebook } from '../../integrations';
import { MailerService } from '../../services';
import {
  EmailCollection,
  EmailTemplateCollection,
  FileCollection,
  UserCollection,
  PermissionCollection,
  UserRoleCollection,
  ProjectCollection,
  RoleCollection,
} from '../../collections';
import { AuthService } from './services';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [AuthController],
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    UserModule,
  ],
  providers: [
    AuthGuard,
    ConfigService,
    AuthService, MailerService,
    Firebase, Hubspot, Google, StripeConstructor, Facebook,
    EmailCollection,
    EmailTemplateCollection,
    FileCollection,
    UserCollection,
    PermissionCollection,
    UserRoleCollection,
    ProjectCollection,
    RoleCollection,
  ],
})
export class AuthModule { }
