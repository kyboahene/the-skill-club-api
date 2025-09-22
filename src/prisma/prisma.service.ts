import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async cleanDB() {
    return this.$transaction([
      this.user.deleteMany(),
      this.permission.deleteMany(),
      this.role.deleteMany(),
      this.job.deleteMany(),
      this.jobSkill.deleteMany(),
      this.application.deleteMany(),
      this.interview.deleteMany(),
      this.company.deleteMany(),
      this.talent.deleteMany(),
      this.talentSkill.deleteMany(),
      this.workHistory.deleteMany(),
      this.education.deleteMany(),
      this.personalProject.deleteMany(),
      this.certificate.deleteMany(),
      this.application.deleteMany(),
      this.interview.deleteMany(),
    ]);
  }
}
