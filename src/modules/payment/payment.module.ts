import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Appointment } from 'src/common/entities/appointment.entity';

import { CaregiverInfoModule } from '../caregiver-info/caregiver-info.module';
import { UserModule } from '../users/user.module';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    CaregiverInfoModule,
    UserModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
