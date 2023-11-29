import { Injectable } from '@nestjs/common';

import { Activity } from 'src/common/entities/activity.entity';
import { Capability } from 'src/common/entities/capability.entity';
import { Diagnosis } from 'src/common/entities/diagnosis.entity';
import { ACTIVITIES_SEED } from 'src/modules/seed/seed-data/activity.seed';
import { DIAGNOSES_SEED } from 'src/modules/seed/seed-data/diagnosis.seed';
import { DeepPartial, EntityManager, EntityTarget } from 'typeorm';

import { CAPABILITIES_SEED } from './seed-data/capability.seed';

@Injectable()
export class SeedingService {
  constructor(private readonly entityManager: EntityManager) {}

  async seed(): Promise<void> {
    await Promise.all([
      this.seedTable(Diagnosis, DIAGNOSES_SEED),
      this.seedTable(Activity, ACTIVITIES_SEED),
      this.seedTable(Capability, CAPABILITIES_SEED),
    ]);
  }

  private async seedTable<T>(
    entity: EntityTarget<T>,
    data: DeepPartial<T>[],
  ): Promise<void> {
    const existingData = await this.entityManager.count(entity);

    if (!existingData) {
      await this.entityManager.save(entity, data);
    }
  }
}