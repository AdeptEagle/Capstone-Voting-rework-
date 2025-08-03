import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TimezoneService } from '../services/timezone.service';

@ApiTags('Timezone')
@Controller('timezone')
export class TimezoneController {
  constructor(private readonly timezoneService: TimezoneService) {}

  @Get('philippine-time')
  @ApiOperation({ summary: 'Get current Philippine time' })
  @ApiResponse({ status: 200, description: 'Current Philippine time retrieved successfully' })
  async getPhilippineTime() {
    const currentTime = this.timezoneService.getCurrentPhilippineTime();
    const timezoneInfo = this.timezoneService.getPhilippineTimezoneInfo();
    
    return {
      currentTime: this.timezoneService.formatPhilippineTimeForDisplay(currentTime),
      timezone: timezoneInfo,
      utcTime: currentTime.toISOString(),
    };
  }

  @Get('philippine-timezone-info')
  @ApiOperation({ summary: 'Get Philippine timezone information' })
  @ApiResponse({ status: 200, description: 'Philippine timezone information retrieved successfully' })
  async getPhilippineTimezoneInfo() {
    return this.timezoneService.getPhilippineTimezoneInfo();
  }

  @Get('convert/:date')
  @ApiOperation({ summary: 'Convert date to Philippine time' })
  @ApiResponse({ status: 200, description: 'Date converted to Philippine time successfully' })
  async convertToPhilippineTime(@Param('date') date: string) {
    const philippineTime = this.timezoneService.convertToPhilippineTime(date);
    
    return {
      originalDate: date,
      philippineTime: this.timezoneService.formatPhilippineTimeForDisplay(philippineTime),
      utcTime: philippineTime.toISOString(),
      timezoneInfo: this.timezoneService.getPhilippineTimezoneInfo(),
    };
  }
} 