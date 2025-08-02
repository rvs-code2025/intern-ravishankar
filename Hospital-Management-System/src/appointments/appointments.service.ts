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
import * as moment from 'moment-timezone';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
  ) {}

  // ✅ Book appointment (Mon–Fri normal, Sat/Sun emergency only)
  async bookAppointment(dto: BookAppointmentDto): Promise<Appointment> {
    const slot = await this.slotRepo.findOne({
      where: { id: dto.slotId },
      relations: ['doctor'],
    });

    if (!slot) throw new NotFoundException('Slot not found');

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

    // Parse slot date
    let parsedDate: moment.Moment;
    if (moment(slot.date, 'YYYY-MM-DD', true).isValid()) {
      parsedDate = moment(slot.date, 'YYYY-MM-DD');
    } else if (moment(slot.date, 'DD-MM-YYYY', true).isValid()) {
      parsedDate = moment(slot.date, 'DD-MM-YYYY');
    } else {
      throw new BadRequestException('Invalid slot date format');
    }

    // Check if weekend and handle emergency case
    const day = parsedDate.format('dddd'); // e.g., "Saturday"
    const isWeekend = ['Saturday', 'Sunday'].includes(day);
    const isEmergency = dto.isEmergency ?? false;

    if (isWeekend && !isEmergency) {
      throw new BadRequestException(
        'Only emergency appointments are allowed on weekends',
      );
    }

    // Booking allowed only between 8:00am-16:00am IST
    const startTime = parsedDate.tz('Asia/Kolkata').hour(8).minute(0).toDate();
    const endTime = parsedDate.tz('Asia/Kolkata').hour(16).minute(0).toDate();
    const now = moment().tz('Asia/Kolkata').toDate();

    if (now < startTime || now > endTime) {
      throw new BadRequestException(
        'Appointment can only be booked between 8:00am and 16:00am IST',
      );
    }

    const appointment = this.appointmentRepo.create({
      slot,
      patient: { id: dto.patientId },
      status: AppointmentStatus.BOOKED,
      isEmergency,
      expiresAt: endTime,
    });

    return this.appointmentRepo.save(appointment);
  }

  // ✅ Get all appointments of a patient
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

  // ✅ Get all appointments
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

  // ✅ Cancel appointment
  async cancelAppointment(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');

    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepo.save(appointment);
  }

  // ✅ Reschedule appointment
  async rescheduleAppointment(
    id: string,
    newSlotId: string,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const newSlot = await this.slotRepo.findOne({
      where: { id: newSlotId },
      relations: ['doctor'],
    });

    if (!newSlot) throw new NotFoundException('New slot not found');

    let parsedDate: moment.Moment;
    if (moment(newSlot.date, 'YYYY-MM-DD', true).isValid()) {
      parsedDate = moment(newSlot.date, 'YYYY-MM-DD');
    } else if (moment(newSlot.date, 'DD-MM-YYYY', true).isValid()) {
      parsedDate = moment(newSlot.date, 'DD-MM-YYYY');
    } else {
      throw new BadRequestException('Invalid new slot date format');
    }

    const endTime = parsedDate.tz('Asia/Kolkata').hour(16).minute(0).toDate();

    appointment.slot = newSlot;
    appointment.status = AppointmentStatus.RESCHEDULED;
    appointment.expiresAt = endTime;

    return this.appointmentRepo.save(appointment);
  }

  // ✅ Auto-expire appointments after 16:00am
  @Cron('*/5 * * * *') // every 5 minutes
  async autoExpireAppointments() {
    const now = new Date();
    await this.appointmentRepo
      .createQueryBuilder()
      .update(Appointment)
      .set({ status: AppointmentStatus.EXPIRED })
      .where('expiresAt < :now', { now })
      .andWhere('status = :status', { status: AppointmentStatus.BOOKED })
      .execute();
  }
}
