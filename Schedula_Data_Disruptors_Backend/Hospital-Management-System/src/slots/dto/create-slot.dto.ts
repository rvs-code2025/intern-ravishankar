import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSlotDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsNotEmpty()
  doctorId: string;
}
