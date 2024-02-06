import { Body, Controller, Post, Get, Render, Query } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
    constructor(private readonly openaiService: OpenaiService) {}

    @Post('ask')
    @Render('ask')
    async ask(@Body() requestBody: any){
        const { prompt, metadata } = requestBody;
        const output = await this.openaiService.queryOpenAI(prompt);
        await this.openaiService.logIntoClickHouse(output);
        return { response: output.response };
    }

    @Get('ask') 
    @Render('ask')
    getAskPage() {
        return { response: null };
    }


    @Get('complete-table')
    @Render('complete-table')
    async getCompleteTable(@Query() filters: any) {
        if (filters) {
            const filteredData = await this.openaiService.getFilterData(filters);
            return { data: filteredData };
        }
        else{
            const completeTable = await this.openaiService.getCompleteTable();
            return { data: completeTable };
        }
    }
}
