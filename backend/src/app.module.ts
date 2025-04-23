import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // 配置模块，加载.env环境变量
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
    }),
    // TypeORM配置，连接MySQL数据库
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOST'),
        port: configService.get('MYSQL_PORT'),
        username: configService.get('MYSQL_USERNAME'),
        password: configService.get('MYSQL_PASSWORD'),
        database: configService.get('MYSQL_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // 自动同步数据库结构，生产环境建议关闭
        autoLoadEntities: true,
      }),
    }),
    // 导入数据库模块
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
