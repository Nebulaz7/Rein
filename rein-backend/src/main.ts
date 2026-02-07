import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express'; // ✅ Add this import

// Global error handlers to prevent crashes from email service socket errors
process.on('uncaughtException', (error: Error) => {
  // Only handle ECONNRESET errors from email service, let others crash
  if (error.message.includes('ECONNRESET') || (error as any).code === 'ECONNRESET') {
    console.warn('⚠️  Email service connection error (ignored):', error.message);
    return;
  }
  
  // For other uncaught exceptions, log and exit
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  // Handle unhandled promise rejections from email service
  if (reason?.code === 'ECONNRESET' || reason?.message?.includes('ECONNRESET')) {
    console.warn('⚠️  Email service promise rejection (ignored):', reason.message);
    return;
  }
  
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  
  app.enableCors({
    origin: ['https://rein-app.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });
  
  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
}

bootstrap();
