import { Module } from '@nestjs/common';
import { GivingController } from './giving.controller';
import { GivingService } from './giving.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GivingController],
  providers: [GivingService],
  exports: [GivingService],
})
export class GivingModule {}
