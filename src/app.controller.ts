import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags('App Status')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @ApiOperation({ summary: "Get app status" })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
