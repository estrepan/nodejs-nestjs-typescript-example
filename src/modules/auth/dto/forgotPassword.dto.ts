import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Response } from '../../../common';

export class ForgotPasswordDto {
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
  public projectId: string;
}

export class ForgotPasswordResponse extends Response {
  @ApiPropertyOptional({
    type: String,
  })
  public data: string;

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
