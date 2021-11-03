import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Response {
  @ApiPropertyOptional()
  public data?: any;

  @ApiPropertyOptional()
  public error?: string | null;

  @ApiPropertyOptional()
  public message?: string | string[] | null;

  @ApiProperty()
  public statusCode: number;
}
