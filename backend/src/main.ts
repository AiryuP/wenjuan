import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const authService = app.get(AuthService);
  const port = configService.get('NEST_PORT') || 4124;
  
  // 配置CORS，允许前端访问
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // 初始化测试用户
  await authService.initTestUser();
  
  console.log(`应用程序正在启动，监听端口: ${port}`);
  await app.listen(port);
}
bootstrap();
