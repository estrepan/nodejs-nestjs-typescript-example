import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Response } from '../../../common';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public projectId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public password: string;
}

export class ResetPasswordResponse extends Response {
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
