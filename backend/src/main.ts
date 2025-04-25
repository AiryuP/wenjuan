import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { ValidationPipe, HttpStatus, HttpException } from '@nestjs/common';
import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';

// 创建全局异常过滤器
class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // 添加适当的类型检查和转换
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
        const responseMessage = (exceptionResponse as Record<string, unknown>).message;
        message = typeof responseMessage === 'string' 
          ? responseMessage 
          : Array.isArray(responseMessage) 
            ? responseMessage.join(', ') 
            : String(responseMessage);
      } else {
        message = exception.message;
      }
    }

    response.status(status).json({
      code: status,
      data: null,
      message: message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const authService = app.get(AuthService);
  const port = configService.get('NEST_PORT') || 4124;
  
  // 设置全局路由前缀为 'api'
  app.setGlobalPrefix('api');
  
  // 配置CORS，允许前端访问
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 注册全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 注册全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,  // 不启用白名单模式，以便接收所有属性
    forbidNonWhitelisted: false,  // 不禁止非白名单属性
    transform: true,
    validationError: { target: false, value: true },  // 显示错误的值
    enableDebugMessages: true,  // 启用调试消息
  }));
  
  // 初始化测试用户
  await authService.initTestUser();
  
  console.log(`应用程序正在启动，监听端口: ${port}`);
  await app.listen(port);
}
bootstrap();
