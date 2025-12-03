import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validationSchema: validationSchema,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('database.uri'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
