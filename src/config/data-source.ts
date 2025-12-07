import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

// Solo cargar .env.dev en desarrollo
if (!isProduction) {
  config({ path: join(__dirname, '../../env/.env.dev') });
}

// Definición de las opciones de conexión
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  
  // En producción, usa DATABASE_URL de Render
  ...(isProduction && process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'coffee_shop',
      }
  ),
  
  // SSL para producción (requerido por Render)
  ssl: isProduction 
    ? { rejectUnauthorized: false }
    : false,

  // Rutas de entidades y migraciones
  entities: isProduction 
    ? [join(__dirname, '../modules/**/*.entity.js'), join(__dirname, '../common/entities/**/*.entity.js')]
    : [join(__dirname, '../modules/**/*.entity.ts'), join(__dirname, '../common/entities/**/*.entity.ts')],
  
  migrations: isProduction
    ? [join(__dirname, '../database/migrations/*.js')]
    : [join(__dirname, '../database/migrations/*.ts')],
  
  synchronize: false,
  logging: !isProduction,
};

export const AppDataSource = new DataSource(dataSourceOptions);