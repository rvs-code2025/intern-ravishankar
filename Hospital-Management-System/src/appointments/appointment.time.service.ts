import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Slot } from '../slots/entities/slot.entity';
import { AppointmentStatus } from './entities/enum.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppointmentTimeService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  async validateAppointmentTime(
    slot: Slot,
    appointmentTime: string,
    isEmergency: boolean,
  ): Promise<void> {
    // Parse appointment time
    const appointmentMoment = moment.tz(
      `${slot.date} ${appointmentTime}`,
      [
        'YYYY-MM-DD HH:mm',
        'DD-MM-YYYY HH:mm',
        'YYYY-MM-DD hh:mma',
        'DD-MM-YYYY hh:mma',
      ],
      true,
      'Asia/Kolkata',
    );

    if (!appointmentMoment.isValid()) {
      throw new BadRequestException('Invalid appointment time format');
    }

    // Calculate end time (30-min duration)
    const appointmentEndMoment = appointmentMoment.clone().add(30, 'minutes');

    // Weekend emergency check
    const day = appointmentMoment.format('dddd');
    const isWeekend = ['Saturday', 'Sunday'].includes(day);
    if (isWeekend && !isEmergency) {
      throw new BadRequestException(
        'Only emergency appointments are allowed on weekends',
      );
    }

    // Booking window: only 08:00am - 9:00am IST
    const now = moment().tz('Asia/Kolkata');
    const bookingStart = now.clone().hour(10).minute(0).second(0);
    const bookingEnd = now.clone().hour(12).minute(0).second(0);

    if (now.isBefore(bookingStart) || now.isAfter(bookingEnd)) {
      throw new BadRequestException(
        'Appointment can only be booked between 10:00am and 11:00am IST',
      );
    }

    // Validate slot range
    const slotStart = moment.tz(
      `${slot.date} ${slot.startTime}`,
      'YYYY-MM-DD hh:mma',
      'Asia/Kolkata',
    );
    const slotEnd = moment.tz(
      `${slot.date} ${slot.endTime}`,
      'YYYY-MM-DD hh:mma',
      'Asia/Kolkata',
    );

    if (
      appointmentMoment.isBefore(slotStart) ||
      appointmentEndMoment.isAfter(slotEnd)
    ) {
      throw new BadRequestException(
        "Appointment time is outside doctor's slot",
      );
    }

    // Conflict check for overlapping times
    const doctorId = slot.doctor.id;

    const conflictingAppointment = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.slot', 'slot')
      .leftJoin('slot.doctor', 'doctor')
      .where('doctor.id = :doctorId', { doctorId })
      .andWhere('slot.date = :date', { date: slot.date })
      .andWhere('appointment.status = :status', {
        status: AppointmentStatus.BOOKED,
      })
      .andWhere(
        `(
    (appointment."appointmentTime"::time BETWEEN :startTime AND :endTime)
    OR
    (
      appointment."appointmentTime"::time < :startTime
      AND (appointment."appointmentTime"::time + interval '30 minutes') > :startTime
    )
  )`,
        {
          startTime: appointmentMoment.format('HH:mm'),
          endTime: appointmentEndMoment.format('HH:mm'),
        },
      )
      .getOne();

    if (conflictingAppointment) {
      throw new BadRequestException(
        'Doctor is not available during this 30-minute window',
      );
    }
  }

  // Auto-expire appointments
  @Cron('*/5 * * * *')
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

  // Auto mark missed appointments after 10 min of start time
  @Cron('*/5 * * * *')
  async autoMarkMissedAppointments() {
    const now = moment().tz('Asia/Kolkata');

    const appointments = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.slot', 'slot')
      .where('appointment.status = :status', {
        status: AppointmentStatus.BOOKED,
      })
      .getMany();

    for (const appointment of appointments) {
      const appointmentDateTime = moment.tz(
        `${appointment.slot.date} ${appointment.appointmentTime}`,
        'YYYY-MM-DD HH:mm',
        'Asia/Kolkata',
      );

      const graceTime = appointmentDateTime.clone().add(10, 'minutes');

      if (now.isAfter(graceTime)) {
        appointment.status = AppointmentStatus.MISSED;
        await this.appointmentRepo.save(appointment);
      }
    }
  }
}
