import { Injectable } from '@nestjs/common';
import { ClickHouse } from 'clickhouse';
// import { ClickHouseRegistry } from 'tr-nestjs-clickhouse';
import { createClient } from '@clickhouse/client';
require('dotenv').config();

const client = createClient({
    host: `https://cqzuj3ha6v.ap-southeast-1.aws.clickhouse.cloud:8443`,
    password: process.env.PASSWORD
})

@Injectable()
export class ClickHouseService {

    async logRequest(data:any): Promise<void>{
        try {
            await client.insert({
              table: 'prompt_response_system',
            values: [
                {
                    date_created: new Date(),
                    status: data.success,
                    request: data.request,
                    response: data.response,
                    model: data.model,
                    total_token: data.total_token,
                    prompt_token: data.prompt_token,
                    completion_token: data.completion_token,
                    latency: data.latency,
                },
            ],
              format: 'JSONEachRow',
            });
      
            console.log('Data inserted successfully');
        } catch (error) {
            console.error('Error inserting data into ClickHouse:', error);
            throw error;
        }
    }

    async getCompleteTable(): Promise<any> {
        console.log('Fetch Information')
        const result = await client.query({
            query : `SELECT * FROM prompt_response_system`,
            format: 'JSONEachRow'
        });
        return (await result.json());
    }

    async getFilteredData(filters: any): Promise<any>{
        let query = 'SELECT * FROM prompt_response_system WHERE 1';
    
        if (filters.startDate && filters.endDate) {
            query += ` AND date_created >= '${filters.startDate}' AND date_created <= '${filters.endDate}'`;
        }
    
        if (filters.property && filters.value) {
            if (filters.property === 'status') {
                const value = filters.value === 'true';
                query += ` AND ${filters.property} = ${value}`;
            } else {
                query += ` AND ${filters.property} = '${filters.value}'`;
            }
        }
            const result = await client.query({
            query,
            format: 'JSONEachRow',
        });
    
        return await result.json();
    }
}
