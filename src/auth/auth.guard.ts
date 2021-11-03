import { Injectable, Inject, forwardRef, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import firebase from 'firebase';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import { AuthUser, Request, User } from '../interfaces';
import { Firebase} from '../integrations';
import { UserService } from '../modules/user/services';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => Reflector)) private reflector: Reflector,
    @Inject(forwardRef(() => ConfigService)) private configService: ConfigService,
    @Inject(forwardRef(() => Firebase)) private firebase: Firebase,
    @Inject(forwardRef(() => UserService)) private userService: UserService
  ) { }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const accessToken: string = (req.headers.authorization ||'').replace('Bearer ', '');
    const permissionsRequired: number[] = this.reflector.get<number[]>('permissions', context.getHandler()) || [];
    const override = this.reflector.get<boolean | undefined>('override-rejection',context.getHandler(),);

    if (this.authRulesValidate(context, accessToken, !!permissionsRequired.length)) {
      return true;
    }

    if (override) {
      return true;
    }

    try {
      const userCredential: firebase.auth.UserCredential = await this.firebase.app.auth().signInWithCustomToken(accessToken);
      const idToken: firebase.auth.IdTokenResult = await userCredential.user.getIdTokenResult();
      const user: User = await this.userService.getUserById(userCredential.user.uid, idToken.claims.projectId);

      req.user = {
        ...user,
        permissions: idToken.claims.permissions,
      } as AuthUser;
      req.projectId = idToken.claims.projectId;

      return !permissionsRequired.length || !_.difference(permissionsRequired, idToken.claims.permissions).length;
    } catch (error) {
      throw new UnauthorizedException(error.message === 'auth/argument-error' ? 'Invalid token' : error.message);
    }
  }

  private authRulesValidate(context: ExecutionContext, accessToken: string, requiredPermissionsExist: boolean): boolean {
    const isGuest: boolean = this.reflector.get<boolean>('isGuest', context.getHandler()) || false;
    const isLoggedIn: boolean = this.reflector.get<boolean>('isLoggedIn', context.getHandler()) || false;

    if (!accessToken && isGuest) {
      return true;
    }

    if ((!accessToken && isLoggedIn) || (accessToken && isGuest) || (!accessToken && requiredPermissionsExist)) {
      throw new UnauthorizedException();
    }

    return false;
  }
}
