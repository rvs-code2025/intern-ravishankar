import { IsUUID, IsBoolean, IsOptional, IsString } from 'class-validator';

export class BookAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  slotId: string;

  @IsString()
  appointmentTime?: string;

  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;
}
