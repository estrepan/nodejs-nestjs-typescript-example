import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  BadGatewayException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Timestamp } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto-js';
import firebase from 'firebase';
import { Firebase, Hubspot, Google } from '../../../integrations';
import { PermissionEnum, EmailTemplateEnum, PrivacyEnum } from '../../../enums';
import { Login, User, ResetPassword, FriendList } from '../../../interfaces';
import { BaseService, MailerService } from '../../../services';
import { LoginDto, SignupDto, ForgotPasswordDto, ResetPasswordDto } from '../dto';
import { UserService } from '../../user/services';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    @Inject(forwardRef(() => Firebase)) protected firebase: Firebase,
    @Inject(forwardRef(() => ConfigService)) private configService: ConfigService,
    @Inject(forwardRef(() => Hubspot)) private hubspot: Hubspot,
    @Inject(forwardRef(() => Google)) private google: Google,
    @Inject(forwardRef(() => MailerService)) private mailerService: MailerService,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {
    super(firebase);
  }

  public async login(dto: LoginDto): Promise<Login> {
    if (!dto.username && !dto.email) {
      throw new BadRequestException('Please provide username or email address.');
    }

    const user: User = dto.username
      ? await this.userService.getUserByUsername(dto.username, dto.projectId)
      : await this.userService.getUserByEmail(dto.email.toLocaleLowerCase(), dto.projectId);

    if (!user) {
      throw new UnauthorizedException('Invalid username/email or password.');
    }

    await this.google.verifyPassword(user.email, dto.password).catch(() => {
      throw new UnauthorizedException('Invalid username/email or password.');
    });

    const permissions: PermissionEnum[] = await this.userService.getUserPermissions(user.id, dto.projectId);

    return this.firebase.admin
      .auth()
      .createCustomToken(user.id, {
        permissions,
        projectId: dto.projectId,
      })
      .then((accessToken: string) => ({
        accessToken,
      }))
      .catch((error: Error) => {
        Logger.error(error);
        throw new BadGatewayException();
      });
  }

  public async signup(dto: SignupDto): Promise<User> {
    const existsUsersAndProject: [User, User] = await Promise.all([
      this.userService.getUserByUsername(dto.username, dto.projectId),
      this.userService.getUserByEmail(dto.email.toLocaleLowerCase(), dto.projectId),
    ]);

    if (existsUsersAndProject[0]) {
      throw new BadRequestException('User with this username already exists.');
    } else if (existsUsersAndProject[1]) {
      throw new BadRequestException('User with this email already exists.');
    }

    const existsFirebaseUser: admin.auth.UserRecord = await this.firebase.admin
      .auth()
      .getUserByEmail(dto.email.toLocaleLowerCase())
      .catch(() => null);

    const fakeEmail: string = existsFirebaseUser ? this.userService.createFakeEmail(existsFirebaseUser.uid) : dto.email.toLocaleLowerCase();

    const firebaseUser: admin.auth.UserRecord = await this.firebase.admin
      .auth()
      .createUser({
        disabled: false,
        displayName: dto.username,
        email: fakeEmail,
        emailVerified: true,
        password: dto.password,
      })
      .catch((error: Error) => {
        throw new BadRequestException(error.message);
      });

    const hubspot: any = await this.hubspot.createOrUpdateContact(dto);
    const userData: User = {
      email: dto.email.toLocaleLowerCase(),
      fake_email: fakeEmail.toLocaleLowerCase(),
      first_name: dto.firstName,
      hubspot_company_id: null,
      hubspot_contact_id: hubspot.vid,
      id: firebaseUser.uid,
      last_name: dto.lastName,
      username: dto.username,
      username_lowercase: dto.username.toLowerCase(),
      privacy: PrivacyEnum.PUBLIC,
      created_at: Timestamp.now(),
      is_deleted: false,
      is_hidden: false,
      user_code: Buffer.from(dto.password, 'utf8').toString('hex'),
    };

    await this.firebase.admin.firestore().runTransaction(async (transaction: admin.firestore.Transaction) =>
      Promise.all([
        transaction.set(
          this.firebase.admin.firestore().collection('projects').doc(dto.projectId).collection('users').doc(firebaseUser.uid),
          userData,
        ),
        transaction.set(this.firebase.admin.firestore().collection('projects').doc(dto.projectId).collection('friends').doc(firebaseUser.uid), {
          id: firebaseUser.uid,
          created_by: firebaseUser.uid,
          created_at: Timestamp.now(),
          friends: [],
          is_deleted: false,
          is_hidden: false,
          updated_at: Timestamp.now(),
          updated_by: firebaseUser.uid,
          blocked: [],
          friend_request_received: [],
          friend_request_sent: [],
        } as FriendList),
      ]),
    );

    await this.mailerService.sendMail({
      data: {
        url: 'http://oluko.com/signup/confirm/p8rbmg7kwfjav6kq',
        userName: `${dto.firstName} ${dto.lastName}`,
      },
      projectId: dto.projectId,
      template: EmailTemplateEnum.USER_SIGNUP_TEMPLATE,
      to: dto.email.toLocaleLowerCase(),
    });

    return userData;
  }

  public async forgotPassword(dto: ForgotPasswordDto): Promise<string> {
    if (!dto.username && !dto.email.toLocaleLowerCase()) {
      throw new BadRequestException('Please provide username or email address.');
    }

    const user: User = dto.username
      ? await this.userService.getUserByUsername(dto.username, dto.projectId)
      : await this.userService.getUserByEmail(dto.email.toLocaleLowerCase(), dto.projectId);

    if (!user) {
      throw new NotFoundException('Invalid username/email.');
    }

    const token: string = crypto.AES.encrypt(
      JSON.stringify({
        expiresAt: Date.now() + 1800000,
        uid: user.id,
      } as ResetPassword),
      'secret',
    ).toString();

    await this.mailerService.sendMail({
      data: {
        url: `http://oluko.com/forgot-password/${token}`,
        userName: user.username || `${user.first_name} ${user.last_name}`,
      },
      projectId: dto.projectId,
      template: EmailTemplateEnum.FORGOT_PASSWORD_TEMPLATE,
      to: dto.email.toLocaleLowerCase(),
    });

    return 'ok';
  }

  public async resetPassword(dto: ResetPasswordDto): Promise<string> {
    let data: ResetPassword;

    try {
      data = JSON.parse(crypto.AES.decrypt(dto.token, 'secret').toString(crypto.enc.Utf8));
    } catch (e) {
      throw new BadRequestException();
    }

    if (Date.now() > data.expiresAt) {
      throw new UnauthorizedException();
    }

    const user: User = await this.userService.getUserById(data.uid, dto.projectId);

    if (!user) {
      throw new NotFoundException();
    }

    await this.firebase.admin
      .auth()
      .updateUser(user.id, { password: dto.password })
      .catch((error: Error) => {
        throw new UnauthorizedException(error.message);
      });

    await this.mailerService.sendMail({
      data: {
        userName: `${user.first_name} ${user.last_name}`,
      },
      projectId: dto.projectId,
      template: EmailTemplateEnum.USER_CHANGE_PASSWORD_TEMPLATE,
      to: user.email,
    });

    return 'ok';
  }
}
