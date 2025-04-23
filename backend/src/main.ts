import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('NEST_PORT') || 4124;
  
  console.log(`应用程序正在启动，监听端口: ${port}`);
  await app.listen(port);
}
bootstrap();
