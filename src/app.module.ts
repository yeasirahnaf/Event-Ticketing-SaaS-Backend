import { Module } from '@nestjs/common';

import { SuperAdminModule } from './superadmin/superadmin.module';

@Module({
  imports: [SuperAdminModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
