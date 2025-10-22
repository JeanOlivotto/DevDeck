import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BoardService } from './board.service';

@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: { name: string }) {
    return this.boardService.create(data);
  }
}
