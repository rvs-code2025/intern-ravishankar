import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { AppointmentStatus } from './entities/enum.entity';
import { Slot } from 'src/slots/entities/slot.entity';
import { AppointmentTimeService } from './appointment.time.service';
import * as moment from 'moment-timezone';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,

    private readonly appointmentTimeService: AppointmentTimeService,
  ) {}

  async bookAppointment(dto: BookAppointmentDto): Promise<Appointment> {
    const slot = await this.slotRepo.findOne({
      where: { id: dto.slotId },
      relations: ['doctor'],
    });

    if (!slot) throw new NotFoundException('Slot not found');

    const isEmergency = dto.isEmergency ?? false;

    // ✅ Check max booking limit
    const bookingsCount = await this.appointmentRepo.count({
      where: {
        slot: { id: slot.id },
        status: AppointmentStatus.BOOKED,
      },
    });

    const limit = slot.doctor.maxBookingsPerSlot;
    if (bookingsCount >= limit) {
      throw new BadRequestException(
        `Slot already booked (${bookingsCount}/${limit})`,
      );
    }

    // ✅ Parse slot date
    let parsedDate: moment.Moment;
    if (moment(slot.date, 'YYYY-MM-DD', true).isValid()) {
      parsedDate = moment(slot.date, 'YYYY-MM-DD');
    } else if (moment(slot.date, 'DD-MM-YYYY', true).isValid()) {
      parsedDate = moment(slot.date, 'DD-MM-YYYY');
    } else {
      throw new BadRequestException('Invalid slot date format');
    }

    // ✅ Prevent booking for past dates
    const today = moment().tz('Asia/Kolkata').startOf('day');
    const slotDate = parsedDate.clone().startOf('day');
    if (slotDate.isBefore(today)) {
      throw new BadRequestException('Cannot book appointment for a past date');
    }

    // ✅ Validate appointmentTime
    if (dto.appointmentTime) {
      await this.appointmentTimeService.validateAppointmentTime(
        slot,
        dto.appointmentTime,
        isEmergency,
      );
    }

    // ✅ Set expiration (9:00 AM IST on the slot date)
    const expiresAt = parsedDate
      .tz('Asia/Kolkata')
      .hour(9)
      .minute(0)
      .second(0)
      .toDate();

    // ✅ Create and save appointment
    const appointment = this.appointmentRepo.create({
      patientId: dto.patientId,
      slotId: dto.slotId,
      appointmentTime: dto.appointmentTime,
      isEmergency,
      status: AppointmentStatus.BOOKED,
      expiresAt,
    });

    return this.appointmentRepo.save(appointment);
  }

  async cancelAppointment(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');

    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepo.save(appointment);
  }

  // ✅ Mark as Attended via
  async markAsAttended(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    appointment.status = AppointmentStatus.ATTENDED;
    appointment.attendedAt = new Date();
    return this.appointmentRepo.save(appointment);
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      return await this.appointmentRepo.find({
        where: { patient: { id: patientId } },
        relations: ['slot', 'patient'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to fetch appointments',
      );
    }
  }

  async getAllAppointments(): Promise<Appointment[]> {
    try {
      return await this.appointmentRepo.find({
        relations: ['slot', 'patient'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to fetch all appointments',
      );
    }
  }
}
