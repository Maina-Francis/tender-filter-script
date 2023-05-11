import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TenderModule } from './tender/tender.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/tendersDB'),
    TenderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
