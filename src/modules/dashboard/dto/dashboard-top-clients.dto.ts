import { ApiProperty } from '@nestjs/swagger';

class TopClientDto {
  @ApiProperty({ description: 'ID of the client' })
  id: string;

  @ApiProperty({ description: 'Name of the client' })
  name: string;

  @ApiProperty({ description: 'Total amount purchased by the client' })
  totalPurchased: number;

  @ApiProperty({ description: 'Number of orders placed by the client' })
  orderCount: number;
}

export class DashboardTopClientsDto {
  @ApiProperty({ type: [TopClientDto], description: 'List of top clients by total purchased amount' })
  topClients: TopClientDto[];
}
