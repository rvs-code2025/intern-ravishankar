import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Patch(':id')
  updateDoctor(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }

  @Get()
  getAll() {
    return this.patientsService.findAll();
  }
}
