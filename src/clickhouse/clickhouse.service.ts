import { Injectable } from '@nestjs/common';
import { createClient, BaseResultSet } from '@clickhouse/client';
require('dotenv').config();

const client = createClient({
    host: `https://cqzuj3ha6v.ap-southeast-1.aws.clickhouse.cloud:8443`,
    password: process.env.DATABASE_PASSWORD
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
            query += ` AND date_created >= '${filters.startDate}' AND date_created <= DATE_ADD('${filters.endDate}', INTERVAL 1 DAY)`;
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

    async fetchMetrics(): Promise<any> {
        const inputTokenPerSeconds = await client.query({
            query: `SELECT date_created as Date, (total_token*1000)/latency as inputTokenPerSeconds FROM prompt_response_system ORDER BY date_created ASC`,
            format: 'JSONEachRow'
        });

        const successVsFailure = await client.query({
            query: `SELECT COUNT(*) as Total, SUM(status) as Success, SUM(1-status) as Failure FROM prompt_response_system`,
            format: 'JSONEachRow'
        });

        const requestsPerDay = await client.query({
            query: `SELECT DATE(date_created) AS Date, COUNT(*) AS Count FROM prompt_response_system GROUP BY Date ORDER BY Date`,
            format: 'JSONEachRow'
        }); 
        const data = {
            inputTokenPerSeconds: await inputTokenPerSeconds.json(),
            successVsFailure: await successVsFailure.json(),
            requestsPerDay: await requestsPerDay.json(),
        };

        return data;
    }
}
