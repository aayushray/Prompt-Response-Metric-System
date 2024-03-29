import { Module } from '@nestjs/common';
import { OpenaiController } from './openai/openai.controller';
import { OpenaiService } from './openai/openai.service';
import { ClickHouseService } from './clickhouse/clickhouse.service';
import { HttpModule } from '@nestjs/axios';
import { ClickHouseModule} from 'tr-nestjs-clickhouse'

@Module({
  imports: [HttpModule],
  controllers: [OpenaiController],
  providers: [OpenaiService, ClickHouseService],
})
export class AppModule {}
