import { Injectable } from '@nestjs/common';
import { ClickHouse } from 'clickhouse';
require('dotenv').config();

@Injectable()
export class ClickHouseService {
    private clickhouse;

    constructor(){
        this.clickhouse = new ClickHouse({
            url: process.env.DATABASE_URL,
            port: 8123,
            queryOptions: {
                database: 'your-database-name',
            },
        })
    }

    async logRequest(data:any): Promise<void>{
        const { prompt, metadata, response } = data;

        try{
            const query = 'INSERT INTO table_name (prompt, response, model) VALUES (?, ?, ?)';
            await this.clickhouse.query(query, [
                prompt,
                response,
                metadata.model,
            ]);
        }
        catch (error) {
            console.error('Error logging to ClickHouse:', error);
            throw error;
        }      
    }
}
