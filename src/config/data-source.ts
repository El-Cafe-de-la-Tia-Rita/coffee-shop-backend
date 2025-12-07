import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm'; // Importar DataSourceOptions
import { join } from 'path';

// Determina qué archivo .env cargar (mantener lógica si es necesario)
const envFile = process.env.NODE_ENV === 'production' 
  ? 'env/.env.prod' 
  : 'env/.env.dev';

config({ path: join(__dirname, '../..', envFile) });

// Definición de las opciones de conexión
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  
  // PRIORIDAD: Usa DATABASE_URL (Render) si existe, si no, usa variables locales
  url: process.env.DATABASE_URL, 
  
  // Configuración local de respaldo
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Delvi0621',
  database: process.env.DB_NAME || 'coffee_shop',
  
  // Configuración de SSL para producción (requerido por Render)
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } // Desactiva la verificación del certificado para la conexión
    : false,

  // Rutas de entidades y migraciones (Asegúrate de que coincidan con la compilación)
  // **Importante: TypeORM en tiempo de ejecución (JS) debe buscar .js**
  entities: [
    'dist/modules/**/*.entity.js', // Cambiado a .js
    'dist/common/entities/**/*.entity.js' // Cambiado a .js
  ],
  migrations: ['dist/database/migrations/*.js'], // Cambiado a .js
  synchronize: false,
  logging: true,
};

export const AppDataSource = new DataSource(dataSourceOptions);