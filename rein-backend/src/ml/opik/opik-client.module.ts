import { Module, Global, DynamicModule } from '@nestjs/common';
import { OpikClientService } from './opik-client.service';

@Global()
@Module({
  providers: [OpikClientService],
  exports: [OpikClientService],
})
export class OpikClientModule {
  static forRoot(): DynamicModule {
    return {
      module: OpikClientModule,
      providers: [OpikClientService],
      exports: [OpikClientService],
    };
  }
}
