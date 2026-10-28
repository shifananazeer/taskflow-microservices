
import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { createObserveModule } from '@nestjs/observe';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { User, UserSchema } from './users/user.schema.js';
import { UsersService } from './users/users.service.js';
import { JwtModule } from '@nestjs/jwt';


export const { ObserveModule, ObserveInstrument } =
  createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        serverSelectionTimeoutMS: 10000,
      }),
    }),

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),

    JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '15m',
  },
}),

    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'auth-service',
    }),
  ],
  controllers: [AppController],
 providers: [AppService, UsersService],
})
export class AppModule {}
