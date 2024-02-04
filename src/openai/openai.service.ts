import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ClickHouseService } from 'src/clickhouse/clickhouse.service';
import { firstValueFrom } from 'rxjs';
require('dotenv').config();

@Injectable()
export class OpenaiService {
    constructor(private clickHouseService: ClickHouseService, private httpService: HttpService) {}

    async queryOpenAI(prompt: string): Promise<any> {
      const apiKey = process.env.OPENAI_API_KEY; 
      const apiUrl = 'https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions'; // Adjust the endpoint based on OpenAI API
  
      try {
        const openAI_response = await firstValueFrom(this.httpService.post(
          apiUrl,
          {
              prompt: prompt,
              max_tokens: 150,
          },
          {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`,
              },
          },
      ));

      const response = {
        status: openAI_response.status,
        data: openAI_response.data,
      }
      // console.log(response)
      // Its Ouput is:
      // response:{
      //   status: 200,
      //   data: {
      //     id: 'cmpl-8o6dqA8AHZtRhUbyESN7fzgZy9oXp',
      //     object: 'text_completion',
      //     created: 1706952622,
      //     model: 'gpt-3.5-turbo-instruct',
      //     choices: [ [Object] ],
      //     usage: { prompt_tokens: 5, completion_tokens: 16, total_tokens: 21 }
      //   }
      // }

      return response;
      } catch (error) {
        console.error('Error calling OpenAI API:', error.response?.data || error.message);
        throw error;
      }
    }

    async logIntoClickHouse(data:any): Promise<void> {
      await this.clickHouseService.logRequest(data);
    }

}
