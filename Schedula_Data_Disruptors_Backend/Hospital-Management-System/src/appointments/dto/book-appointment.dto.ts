import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class BookAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  slotId: string;

  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;
}
