import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { Response } from '../../../common';
import { Login } from '../../../interfaces';

export class LoginDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  public email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public username?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public password: string;

  @ApiProperty()
  // @IsNotEmpty()
  @IsString()
  public projectId: string;
}

class LoginResponseData implements Login {
  @ApiProperty()
  public accessToken: string;
}

export class LoginResponse extends Response {
  @ApiPropertyOptional({
    type: LoginResponseData,
  })
  public data?: LoginResponseData;

  @ApiPropertyOptional({
    example: null,
  })
  public error?: string | null;

  @ApiPropertyOptional({
    example: null,
  })
  public message?: string | string[] | null;

  @ApiProperty({
    example: 200,
  })
  public statusCode: number;
}
