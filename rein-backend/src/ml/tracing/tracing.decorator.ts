import { OpikClientService } from '../opik/opik-client.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('TracingDecorator');

export function Trace(options?: {
  name?: string;
  metadata?: Record<string, any>;
  captureArgs?: boolean;
  captureResult?: boolean;
}) {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const opikService: OpikClientService = this.opikService;

      if (!opikService) {
        logger.warn(
          `OpikClientService not injected into ${target.constructor.name}`,
        );
        return originalMethod.apply(this, args);
      }

      const traceName =
        options?.name ||
        `${target.constructor.name}.${String(propertyKey)}`;

      const startTime = Date.now();
      let trace;

      try {
        trace = opikService.startTrace(traceName, {
          method: propertyKey,
          class: target.constructor.name,
          ...options?.metadata,
        });

        // Capture arguments
        if (options?.captureArgs !== false) {
          const input = args.map((arg) => {
            if (typeof arg === 'object' && arg !== null) {
              return JSON.stringify(arg).substring(0, 500); // Limit size
            }
            return arg;
          });

          const span = opikService.createSpan(trace, `input_${String(propertyKey)}`, {
            args: input,
          });
          opikService.endSpan(span, { captured: true });
        }

        // Execute the original method
        const result = await originalMethod.apply(this, args);

        // Capture result
        if (options?.captureResult !== false && result) {
          const output =
            typeof result === 'object'
              ? JSON.stringify(result).substring(0, 500)
              : result;

          const span = opikService.createSpan(trace, `output_${String(propertyKey)}`, {
            result: output,
          });
          opikService.endSpan(span, { captured: true });
        }

        const duration = Date.now() - startTime;
        opikService.endTrace(trace);

        logger.debug(
          `Trace ${traceName} completed in ${duration}ms`,
        );

        return result;
      } catch (error) {
        if (trace) {
          opikService.endTrace(trace);
        }

        logger.error(
          `Error in traced method ${traceName}:`,
          error,
        );

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Span decorator for sub-operations within a trace
 */
export function TraceSpan(options?: {
  name?: string;
  captureInput?: boolean;
  captureOutput?: boolean;
}) {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const opikService: OpikClientService = this.opikService;

      if (!opikService) {
        return originalMethod.apply(this, args);
      }

      const spanName =
        options?.name || `span_${String(propertyKey)}`;

      // Note: In a real implementation, we'd get the current trace from context
      // This is a simplified version
      const input = options?.captureInput
        ? args.reduce((acc, arg, idx) => {
            acc[`arg_${idx}`] = arg;
            return acc;
          }, {})
        : undefined;

      try {
        const result = await originalMethod.apply(this, args);

        logger.debug(`Span ${spanName} completed successfully`);

        return result;
      } catch (error) {
        logger.error(`Error in span ${spanName}:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}
