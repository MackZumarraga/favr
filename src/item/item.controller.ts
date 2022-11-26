import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { ItemService } from './item.service';
import { GetUser } from '../auth/decorator';
import { CreateItemDto, EditItemDto } from './dto';

@UseGuards(JwtGuard)
@Controller('items')
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Get()
  getItems(@GetUser('id') userId: number) {
    return this.itemService.getItems(userId);
  }

  @Get(':id')
  getItemById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) itemId: number,
  ) {
    return this.itemService.getItemById(userId, itemId);
  }

  @Post()
  createItem(@GetUser('id') userId: number, @Body() dto: CreateItemDto) {
    return this.itemService.createItem(userId, dto);
  }

  @Patch(':id')
  editItemById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) itemId: number,
    @Body() dto: EditItemDto,
  ) {
    return this.itemService.editItemById(userId, itemId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteItemById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) itemId: number,
  ) {
    return this.itemService.deleteItemById(userId, itemId);
  }
}
