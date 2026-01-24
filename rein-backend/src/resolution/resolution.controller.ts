import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { ResolutionService } from './resolution.service';

@Controller('resolution')
export class ResolutionController {
  constructor(private readonly resolutionService: ResolutionService,) {}

  @Post()
  async create(@Body() body: { userId: string; title: string; goal: string; roadmap: any }) {
    const { userId, title, goal, roadmap } = body;
    return this.resolutionService.create(userId, title, goal, roadmap);
  }

  @Get('user/:userId')
  async getAllByUser(@Param('userId') userId: string) {
    return this.resolutionService.findAllByUser(userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Query('userId') userId?: string) {
    const resolution = await this.resolutionService.findOne(id, userId);
    if (!resolution) {
      throw new NotFoundException('Resolution not found');
    }
    return resolution;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Query('userId') userId: string) {
    return this.resolutionService.delete(id, userId);
  }

  @Patch(':id/public')
  async togglePublic(@Param('id') id: string, @Body() body: { userId: string; isPublic: boolean }) {
    return this.resolutionService.togglePublic(id, body.userId, body.isPublic);
  }
}