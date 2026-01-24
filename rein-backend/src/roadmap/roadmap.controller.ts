import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';

@Controller('roadmap')
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService,) {}

  @Post()
  async create(@Body() body: { userId: string; title: string; goal: string; roadmap: any }) {
    const { userId, title, goal, roadmap } = body;
    return this.roadmapService.create(userId, title, goal, roadmap);
  }

  @Get('user/:userId')
  async getAllByUser(@Param('userId') userId: string) {
    return this.roadmapService.findAllByUser(userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Query('userId') userId?: string) {
    const roadmap = await this.roadmapService.findOne(id, userId);
    if (!roadmap) {
      throw new NotFoundException('Roadmap not found');
    }
    return roadmap;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Query('userId') userId: string) {
    return this.roadmapService.delete(id, userId);
  }

  @Patch(':id/public')
  async togglePublic(@Param('id') id: string, @Body() body: { userId: string; isPublic: boolean }) {
    return this.roadmapService.togglePublic(id, body.userId, body.isPublic);
  }
}