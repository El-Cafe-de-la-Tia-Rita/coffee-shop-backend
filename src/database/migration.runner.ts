import { AppDataSource } from '../config/data-source';

export async function runMigrations() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    
    console.log('🔄 Running pending migrations...');
    await AppDataSource.runMigrations();
    
    console.log('✅ Migrations completed successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}