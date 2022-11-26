import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto, EditItemDto } from './dto';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  getItems(userId: number) {
    return this.prisma.item.findMany({
      where: {
        userId,
      },
    });
  }

  getItemById(userId: number, itemId: number) {
    return this.prisma.item.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });
  }

  async createItem(userId: number, dto: CreateItemDto) {
    const item = await this.prisma.item.create({
      data: {
        userId,
        ...dto,
      },
    });

    return item;
  }

  async editItemById(userId: number, itemId: number, dto: EditItemDto) {
    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item || item.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.item.update({
      where: {
        id: itemId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteItemById(userId: number, itemId: number) {
    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item || item.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.item.delete({
      where: {
        id: itemId,
      },
    });
  }
}
