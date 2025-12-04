import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(@InjectConnection() private readonly connection: Connection) {}

    @Get()
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, description: 'Service is healthy' })
    @ApiResponse({ status: 503, description: 'Service is unhealthy' })
    async check() {
        const dbStatus = this.connection.readyState === 1;

        if (!dbStatus) {
            throw new ServiceUnavailableException({
                status: 'error',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: {
                    status: 'disconnected',
                    name: this.connection.name,
                },
            });
        }

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: {
                status: 'connected',
                name: this.connection.name,
            },
        };
    }
}
