import app from './app';
import { testConnection } from './config/database';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Attempt database connection check
    try {
      await testConnection();
    } catch (dbErr) {
      logger.warn('MySQL database connection failed — running in fallback mode:', dbErr);
    }

    app.listen(PORT, () => {
      logger.info(`🚀 MediChain Backend API running on port ${PORT}`);
      logger.info(`📡 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

