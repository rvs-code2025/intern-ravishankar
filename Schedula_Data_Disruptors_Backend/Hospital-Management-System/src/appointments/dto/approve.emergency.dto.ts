import { IsUUID } from 'class-validator';
export class ApproveEmergencyDto {
  @IsUUID()
  appointmentId: string;

  @IsUUID()
  adminId: string;
}
