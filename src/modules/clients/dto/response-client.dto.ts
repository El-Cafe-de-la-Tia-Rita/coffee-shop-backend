import { ApiProperty } from '@nestjs/swagger';

export class ResponseClientDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  first_purchase: Date;

  @ApiProperty()
  last_purchase: Date;

  @ApiProperty()
  marketing_opt_in: boolean;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
