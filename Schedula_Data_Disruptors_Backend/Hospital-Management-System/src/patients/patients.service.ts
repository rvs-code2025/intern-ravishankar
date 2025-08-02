import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { RegisterPatinetDto } from '../auth/dto/register.patient';
import { UpdatePatientDto } from './dto/update-patient.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  async register(registerDto: RegisterPatinetDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newPatient = this.patientRepo.create({
      ...registerDto,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: hashedPassword,
    });
    return this.patientRepo.save(newPatient);
  }

  async getpatientProfile(userId: string) {
    return this.patientRepo.findOne({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
      },
    });
  }

  async findByEmail(email: string): Promise<Patient | null> {
    return this.patientRepo.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdatePatientDto) {
    const patient = await this.patientRepo.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('patient not found');
    Object.assign(patient, dto);
    return this.patientRepo.save(patient);
  }

  async findAll(): Promise<Patient[]> {
    return this.patientRepo.find();
  }
}
