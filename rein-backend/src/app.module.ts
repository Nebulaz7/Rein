import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeneratorModule } from './generator/generator.module';
import { CommonModule } from './common/common.module';
import { ResolutionModule } from './resolution/resolution.module';
import { UserModule } from './user/user.module';
import { ContextModule } from './context/context.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GeneratorModule,
    ContextModule,
    CommonModule,
    ResolutionModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
