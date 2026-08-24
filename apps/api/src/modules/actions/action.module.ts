import { Module } from '@nestjs/common';
import { ActionExecutorService } from './action.executor.js';
import { ActionRepository } from './action.repository.js';
import { ActionService } from './action.service.js';

@Module({
  providers: [ActionRepository, ActionService, ActionExecutorService],
  exports: [ActionService],
})
export class ActionsModule {}
