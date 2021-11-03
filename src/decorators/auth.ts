import { SetMetadata } from '@nestjs/common';

export const IsGuest: any = () => SetMetadata('isGuest', true);
export const IsLoggedIn: any = () => SetMetadata('IsLoggedIn', true);
