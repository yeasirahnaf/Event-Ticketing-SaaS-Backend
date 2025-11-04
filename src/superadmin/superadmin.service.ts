import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './superadmin.dto';

@Injectable()
export class SuperAdminService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createAdminDto: CreateAdminDto): Promise<{ message: string }> {
    return Promise.resolve({ message: JSON.stringify(createAdminDto) });
  }
}
