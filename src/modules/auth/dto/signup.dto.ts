import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Response } from '../../../common';

export class SignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public readonly username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  public readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public readonly password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public readonly firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public readonly lastName: string;

  @ApiProperty()
  // @IsNotEmpty()
  @IsString()
  public readonly projectId: string;
}

class SignupResponseData {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public firstName: string;

  @ApiProperty()
  public lastName: string;

  @ApiProperty()
  public email: string;

  @ApiPropertyOptional()
  public hubspotCompanyId: string;

  @ApiProperty()
  public hubspotContactId: string;

  @ApiProperty()
  public projectId: string;
}

export class SignupResponse extends Response {
  @ApiPropertyOptional({
    type: SignupResponseData,
  })
  public data: SignupResponseData;

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
