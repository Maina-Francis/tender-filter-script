import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { keywords } from './filters/filter.keywords';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Tender } from './schemas/tender.schema';
import { Cron } from '@nestjs/schedule';
import { TodoService } from './microsoft to-do graph api/todo.service';

@Injectable()
export class TenderService {
  constructor(
    @InjectModel(Tender.name) private tenderModel: mongoose.Model<Tender>,
    @InjectModel('newTenders') private newTenderModel: mongoose.Model<Tender>,
    private httpService: HttpService,
    private todoService: TodoService,
  ) {}

  //   Get all open tenders filtered by keywords
  // @Cron('0 0 1 * * 1-6') // Schedule to fetch all new open tenders monday - saturday @1am
  @Cron('30 * * * * *') //runs every 30 seconds for test purposes
  async getTenders(): Promise<string> {
    // Delete everything in the newTenders collection
    await this.newTenderModel.deleteMany({});

    // Fetch data from the GOK tender api
    const url = 'https://tenders.go.ke/api/TenderDisplay/OpenTenders/Open/';
    const { data } = await firstValueFrom(this.httpService.get(url));

    // const newData = [];

    // Filter data by keywords
    const filteredData: Tender[] = [];
    // console.log(keywords);
    for (const tender of data) {
      const tenderTitle = tender.title.toLowerCase();
      // check whether the title includes the keywords
      const hasKeyword = keywords.some((keyword) =>
        tenderTitle.includes(keyword),
      );
      if (hasKeyword) {
        filteredData.push(tender);
      }
    }

    // console.log(filteredData);
    // Check if the data already exists, then add it to the db if it doesn't
    for (let i = 0; i < filteredData.length; i++) {
      const checkFromDb = await this.tenderModel.find({
        id_tenderdetails: filteredData[i].id_tenderdetails,
      });

      if (checkFromDb.length == 0) {
        await this.tenderModel.create(filteredData[i]);
        await this.newTenderModel.create(filteredData[i]);
      }
    }

    return 'Successfully updated the tender data';
  }

  @Cron('45 * * * * *') //runs every 45 seconds for testing purposes
  async getNewTenders() {
    const newTenders = await this.newTenderModel.find().exec();
    if (newTenders.length === 0) {
      return 'No new tenders available';
    }

    await this.todoService.createTodoListFromCollection();

    return 'New tenders added to the collection';
  }
}
