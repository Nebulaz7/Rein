import { Module, Global, DynamicModule } from '@nestjs/common';
import { OpikClientService } from './opik-client.service';
import { OpikPromptVersioningService } from './opik-prompt-versioning.service';
import { OpikPromptRegistryService } from './opik-prompt-registry.service';
import { OpikPromptEvaluationService } from './opik-prompt-evaluation.service';

@Global()
@Module({
  providers: [OpikClientService, OpikPromptVersioningService, OpikPromptRegistryService, OpikPromptEvaluationService],
  exports: [OpikClientService, OpikPromptVersioningService, OpikPromptRegistryService, OpikPromptEvaluationService],
})
export class OpikClientModule {
  static forRoot(): DynamicModule {
    return {
      module: OpikClientModule,
      providers: [OpikClientService, OpikPromptVersioningService, OpikPromptRegistryService, OpikPromptEvaluationService],
      exports: [OpikClientService, OpikPromptVersioningService, OpikPromptRegistryService, OpikPromptEvaluationService],
    };
  }
}
