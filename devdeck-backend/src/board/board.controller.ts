/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/board/board.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { BoardService } from './board.service';
import {
  CreateBoardDto,
  UpdateBoardDto,
  ReorderBoardsDto,
} from './dto/board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBoardDto: CreateBoardDto, @Req() req) {
    const userId = req.user.userId;
    // CORREÇÃO: Passar userId como segundo argumento
    return this.boardService.create(createBoardDto, userId); // <--- CORRIGIDO
  }

  @Get()
  findAll(@Req() req, @Query('groupId') groupId?: string) {
    const userId = req.user.userId;
    let groupIdNum: number | undefined = undefined;

    if (groupId !== undefined) {
      groupIdNum = parseInt(groupId, 10);
      if (isNaN(groupIdNum)) {
        throw new BadRequestException('groupId deve ser um número válido');
      }
    }

    return this.boardService.findAll(userId, groupIdNum);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.OK)
  reorder(@Body() reorderBoardsDto: ReorderBoardsDto, @Req() req) {
    const userId = req.user.userId;
    return this.boardService.reorderBoards(reorderBoardsDto, userId);
  }

  // findOne, update, remove já estavam corretos, passando userId
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.userId;
    return this.boardService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    return this.boardService.update(id, updateBoardDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.userId;
    return this.boardService.remove(id, userId);
  }
}
