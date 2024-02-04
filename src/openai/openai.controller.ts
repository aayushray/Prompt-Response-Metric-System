import { Body, Controller, Post } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
    constructor(private readonly openaiService: OpenaiService) {}

    @Post('ask')
    async ask(@Body() requestBody: any){
        const { prompt, metadata } = requestBody;
        const response = await this.openaiService.queryOpenAI(prompt);

        // await this.openaiService.logIntoClickHouse(response)
        return response.data.choices[0].text;
    }
}
