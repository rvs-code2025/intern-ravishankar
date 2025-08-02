import { IsUUID } from 'class-validator';

export class EmergencyAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  slotId: string;

  @IsUUID()
  requestedBy: string; // Only admin
}
