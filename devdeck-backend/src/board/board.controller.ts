import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/board.dto';

@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // Retorna 201 Created
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardService.create(createBoardDto);
  }

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // Usa ParseIntPipe para converter e validar o ID
    return this.boardService.findOne(id);
  }

  // Opcional: Adicionar endpoints para Update e Delete
  // @Patch(':id')
  // update(@Param('id', ParseIntPipe) id: number, @Body() updateBoardDto: UpdateBoardDto) { ... }

  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: number) { ... }
}
