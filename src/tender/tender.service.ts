import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TenderService {
  constructor(private httpService: HttpService) {}

  //   Get all tender data
  async getTenders(): Promise<any> {
    const url = 'https://tenders.go.ke/api/TenderDisplay/OpenTenders/Open/';
    const { data } = await firstValueFrom(this.httpService.get(url));

    return data;
  }

  //   const filteredData = data.filter(
  //     (tender) => tender.procurementcategory === 'Non Consultancy Services',
  //   );

  //   return filteredData;
}