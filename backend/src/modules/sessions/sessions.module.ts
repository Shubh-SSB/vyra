import { Module } from '@nestjs/common';
import { SessionService } from './services/session.service';
import { SessionRepository } from './repositories/session.repository';
import { CommonModule } from '../../common/common.module';

@Module({
    imports: [CommonModule],
    providers: [SessionRepository, SessionService],
    exports: [SessionService],
})
export class SessionsModule {}