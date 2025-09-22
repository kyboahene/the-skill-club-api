import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto, UpdateSkillDto } from './dto';
import { PaginationService } from '../pagination/pagination.service';

@Injectable()
export class SkillsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly paginationService: PaginationService
	) {}

	async findSkills(
		page: number,
		pageSize: number,
		all?: boolean,
		filters?: { search?: string; category?: string }
	) {
		const where: Prisma.SkillWhereInput = {};
		if (filters?.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: 'insensitive' } },
				{ description: { contains: filters.search, mode: 'insensitive' } },
			];
		}
		if (filters?.category) {
			where.category = filters.category;
		}
		return await this.paginationService.paginate('skill', {
			all,
			page,
			pageSize,
			where,
			orderBy: { createdAt: 'desc' },
		});
	}

	async getSkill(id: string) {
		const skill = await this.prisma.skill.findUnique({ where: { id } });
		if (!skill) {
			throw new NotFoundException(`Skill with ID ${id} not found`);
		}
		return skill;
	}

	async createSkill(createSkillDto: CreateSkillDto) {
		try {
			return await this.prisma.skill.create({ data: createSkillDto });
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException('Skill with this name already exists');
				}
			}
			throw error;
		}
	}

	async updateSkill(id: string, updateSkillDto: UpdateSkillDto) {
		await this.getSkill(id);
		return this.prisma.skill.update({ where: { id }, data: updateSkillDto });
	}

	async deleteSkill(id: string) {
		await this.getSkill(id);
		await this.prisma.skill.delete({ where: { id } });
		return { message: 'Skill deleted successfully' };
	}
}
