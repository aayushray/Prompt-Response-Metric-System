import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ClickHouseService } from 'src/clickhouse/clickhouse.service';
import { firstValueFrom } from 'rxjs';
import { start } from 'repl';
require('dotenv').config();

@Injectable()
export class OpenaiService {
    constructor(private clickHouseService: ClickHouseService, private httpService: HttpService) {}

    async queryOpenAI(prompt: string): Promise<any> {
      const apiKey = process.env.OPENAI_API_KEY; 
      const apiUrl = 'https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions'; // Adjust the endpoint based on OpenAI API
      
      const startTime = Date.now();
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

        // response:{
        //   status: 200,
        //   data: {
        //     id: 'cmpl-8o6dqA8AHZtRhUbyESN7fzgZy9oXp',
        //     object: 'text_completion',
        //     created: 1706952622,
        //     model: 'gpt-3.5-turbo-instruct',
        //     choices: [ [Object] ],
        //     usage: { prompt_tokens: 5, completion_tokens: 16, total_tokens: 21 }
        //   },
        //   latency: 1000,
        //   success: 1
        // }

        
        const endTime = Date.now();
        const output = {
          success: true,
          request: prompt,
          response: openAI_response.data.choices[0].text,
          model: openAI_response.data.model,
          total_token: (openAI_response.data.usage.total_tokens),
          prompt_token: (openAI_response.data.usage.prompt_tokens),
          completion_token: (openAI_response.data.usage.completion_tokens),
          latency: endTime-startTime,
        }
        // await this.logIntoClickHouse({output});

        return output;
      } catch (error) {
        const endTime = Date.now();
        const output = {
          success: false,
          request: prompt,
          response: "",
          model: "",
          total_token: 0,
          prompt_token: 0,
          completion_token: 0,
          latency: endTime-startTime,
        }
        await this.logIntoClickHouse({output});
        // console.error('Error calling OpenAI API:', error.response?.data || error.message);
        throw error;
      }
    }

    async logIntoClickHouse(data:any): Promise<void> {
      await this.clickHouseService.logRequest(data);
    }

    async getCompleteTable(): Promise<any[]> {
      return this.clickHouseService.getCompleteTable();
    }
  
    async getFilterData(filters: any): Promise<any[]> {
      return this.clickHouseService.getFilteredData(filters);
    }
}
