import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'path';

// Determina qué archivo .env cargar
const envFile = process.env.NODE_ENV === 'production' 
  ? 'env/.env.prod' 
  : 'env/.env.dev';

config({ path: join(__dirname, '../..', envFile) });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Delvi0621',
  database: process.env.DB_NAME || 'coffee_shop',
  entities: [
    'src/modules/**/*.entity.ts',
    'src/common/entities/**/*.entity.ts'
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});