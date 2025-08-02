import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentsService) {}

  @Post('book')
  book(@Body() dto: BookAppointmentDto) {
    return this.appointmentService.bookAppointment(dto);
  }

  @Get('patient/:id')
  getForPatient(@Param('id') patientId: string) {
    return this.appointmentService.getPatientAppointments(patientId);
  }

  @Get()
  getAll() {
    return this.appointmentService.getAllAppointments();
  }

  @Patch('cancel/:id')
  cancel(@Param('id') id: string) {
    return this.appointmentService.cancelAppointment(id);
  }

  @Patch('/reschedule')
  reschedule(@Param('id') id: string, @Query('newSlotId') newSlotId: string) {
    return this.appointmentService.rescheduleAppointment(id, newSlotId);
  }
}
