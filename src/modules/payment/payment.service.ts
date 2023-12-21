import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Appointment } from 'src/common/entities/appointment.entity';
import { ErrorMessage } from 'src/common/enums/error-message.enum';
import { EntityManager, Repository } from 'typeorm';

import { MINIMUM_BALANCE } from '../appointment/appointment.constants';
import { CaregiverInfoService } from '../caregiver-info/caregiver-info.service';
import { UserService } from '../users/user.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly userService: UserService,
    private readonly caregiverInfoService: CaregiverInfoService,
  ) {}

  private async findAppointmentById(appointmentId): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    return appointment;
  }

  public async payForHourOfWork(
    userId: string,
    caregiverInfoId: string,
    transactionalEntityManager: EntityManager,
  ): Promise<number> {
    try {
      const { balance, email } = await this.userService.findById(userId);

      const caregiverInfo =
        await this.caregiverInfoService.findUserByCaregiverInfoId(
          caregiverInfoId,
        );

      if (!caregiverInfo) {
        throw new HttpException(
          ErrorMessage.CaregiverInfoNotFound,
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedSeekerBalance = balance - caregiverInfo.hourlyRate;

      if (updatedSeekerBalance < MINIMUM_BALANCE) {
        throw new HttpException(
          ErrorMessage.NotEnoughMoney,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.userService.updateWithTransaction(
        email,
        { balance: updatedSeekerBalance },
        transactionalEntityManager,
      );

      return caregiverInfo.hourlyRate;
    } catch (error) {
      if (
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.BAD_REQUEST
      ) {
        throw error;
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async payForCompletedAppointment(
    appointmentId: string,
    transactionalEntityManager: EntityManager,
  ): Promise<void> {
    try {
      // Находим appointment по appointmentId
      const appointment = await this.findAppointmentById(appointmentId);

      if (!appointment) {
        throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
      }

      // Вычисляем длину встречи в минутах
      const { startDate, endDate } = appointment;
      const startTime = startDate.getTime();
      const endTime = endDate.getTime();
      const appointmentDuration = (endTime - startTime) / (1000 * 60 * 60);
      console.log(`Длина аппоинтменента - ${appointmentDuration}`);

      // Получаем информацию о caregiver'е из appointment
      const { caregiverInfoId } = appointment;
      const caregiverInfo =
        await this.caregiverInfoService.findById(caregiverInfoId);

      if (!caregiverInfo) {
        throw new HttpException(
          'Caregiver info not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Вычисляем сумму для оплаты
      const amountToPay = appointmentDuration * caregiverInfo.hourlyRate;
      console.log(
        `Need to pay ${amountToPay}, hour rate - ${caregiverInfo.hourlyRate}`,
      );

      // Получаем информацию о пользователе из appointment
      const { userId } = appointment;
      const { balance, email } = await this.userService.findById(userId);
      // Проверяем, достаточно ли у пользователя средств для оплаты
      if (balance < amountToPay) {
        throw new HttpException('Insufficient funds', HttpStatus.BAD_REQUEST);
      }

      // Вычитаем сумму оплаты из баланса пользователя
      const updatedBalance = balance - amountToPay;

      // Обновляем баланс пользователя
      await this.userService.updateWithTransaction(
        email,
        {
          balance: updatedBalance,
        },
        transactionalEntityManager,
      );

      console.log(
        `Payment of ${amountToPay}$ successfully processed for appointment ${appointmentId}`,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  public async chargeRecurringPaymentTask(
    appointmentId: string,
  ): Promise<void> {
    // Создание задачи для регулярных платежей
    // const activityLogs = await this.activityLogRepository.findOne({
    //   where: {
    //     status: 'confirmed' || 'rejected',
    //     appointmentId,
    //     timestamp: {
    //       $gte: startOfCurrentWeek,
    //       $lte: endOfCurrentWeek,
    //     },
    //   },
    // });
    // activityLogs.forEach();

    // const appointment = await this.findAppointmentById(appointmentId);
    // if (JSON.parse(appointment.weekday).length() === activityLogs.length()) {
    // }

    console.log(`You were charged, ${appointmentId}`);
  }

  public async chargeForOneTimeAppointment(
    appointmentId: string,
  ): Promise<void> {
    const appointment = await this.findAppointmentById(appointmentId);
    console.log(appointment);
    try {
      await this.appointmentRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await this.payForCompletedAppointment(
            appointmentId,
            transactionalEntityManager,
          );
        },
      );
    } catch (error) {
      throw new Error(error);
    }
    console.log(`Charged for one time appointment`);
  }
}
