import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const { password, ...rest } = dto;
    return this.prisma.user.create({
      data: { ...rest, passwordHash },
      select: this.publicSelect(),
    });
  }

  findAll() {
    return this.prisma.user.findMany({ select: this.publicSelect() });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.publicSelect(),
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: this.publicSelect(),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { id, deleted: true };
  }

  // Never expose passwordHash to API consumers
  private publicSelect() {
    return {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      city: true,
      createdAt: true,
    } as const;
  }
}
