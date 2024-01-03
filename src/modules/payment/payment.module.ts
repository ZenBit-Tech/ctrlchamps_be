import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityLog } from 'src/common/entities/activity-log.entity';
import { Appointment } from 'src/common/entities/appointment.entity';
import { TransactionHistory } from 'src/common/entities/transaction-history.entity';

import { AppointmentModule } from '../appointment/appointment.module';
import { CaregiverInfoModule } from '../caregiver-info/caregiver-info.module';
import { UserModule } from '../users/user.module';

import { PaymentService } from './payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, ActivityLog, TransactionHistory]),
    forwardRef(() => AppointmentModule),
    CaregiverInfoModule,
    UserModule,
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
