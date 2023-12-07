import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  UnauthorizedException,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Appointment } from 'src/common/entities/appointment.entity';
import { ApiPath } from 'src/common/enums/api-path.enum';
import { ErrorMessage } from 'src/common/enums/error-message.enum';
import {
  APPOINTMENTS_EXAMPLE,
  APPOINTMENT_EXAMPLE,
} from 'src/modules/appointment/appointment.constants';
import { AppointmentService } from 'src/modules/appointment/appointment.service';
import { CreateAppointmentDto } from 'src/modules/appointment/dto/create-appointment.dto';
import { AppointmentApiPath } from 'src/modules/appointment/enums/appointment.api-path.enum';
import { TokenGuard } from 'src/modules/auth/middleware/auth.middleware';
import { AuthenticatedRequest } from 'src/modules/auth/types/user.request.type';

@ApiTags('Appointment')
@Controller(ApiPath.Appointment)
@UseGuards(TokenGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @ApiOperation({ summary: 'Appointment creating' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Appointment was created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: ErrorMessage.NotEnoughMoney,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessage.InternalServerError,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(AppointmentApiPath.Root)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<void> {
    const userId = req.user.id;

    if (!userId) {
      throw new UnauthorizedException(ErrorMessage.UserIsNotAuthorized);
    }

    await this.appointmentService.create(createAppointmentDto, userId);
  }

  @ApiOperation({ summary: 'Appointment getting by Id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment was sent successfully',
    schema: {
      example: APPOINTMENT_EXAMPLE,
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: ErrorMessage.AppointmentNotFound,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessage.InternalServerError,
  })
  @Get(AppointmentApiPath.AppointmentId)
  async getOne(
    @Param('appointmentId') appointmentId: string,
  ): Promise<Appointment> {
    return this.appointmentService.findOneById(appointmentId);
  }

  @ApiOperation({ summary: 'All appointments getting' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointments were sent successfully',
    schema: {
      example: APPOINTMENTS_EXAMPLE,
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: ErrorMessage.AppointmentNotFound,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: ErrorMessage.InternalServerError,
  })
  @Get(AppointmentApiPath.Root)
  async getAll(@Req() req: AuthenticatedRequest): Promise<Appointment[]> {
    return this.appointmentService.findAllByUserId(req.user.id);
  }
}
