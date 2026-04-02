import type { Attributes, Span } from '@opentelemetry/api'
import type { FastifyRequest } from 'fastify'
import {
  annotateActiveRequestSpan,
  getRequestTelemetryMetadata,
  recordHttpServerRequestMetrics,
  registerHttpTelemetry,
  runObservedOperation,
  type ObservedOperationOptions,
  type OperationTelemetryMetadata,
} from './application-telemetry'

export type RouteTelemetryMetadata = OperationTelemetryMetadata
export type UseCaseTelemetryOptions = {
  useCase: string
  resource: string
  action: string
  endpointGroup?: string
  spanName?: string
  spanAttributes?: Attributes
  logAttributes?: Record<string, unknown>
}

export {
  annotateActiveRequestSpan,
  getRequestTelemetryMetadata,
  recordHttpServerRequestMetrics,
  registerHttpTelemetry,
  runObservedOperation,
  type ObservedOperationOptions,
  type OperationTelemetryMetadata,
}

export const annotateActiveHttpSpan = annotateActiveRequestSpan
export const recordHttpRequestMetrics = recordHttpServerRequestMetrics

export async function withObservedUseCase<T>(
  request: FastifyRequest,
  options: UseCaseTelemetryOptions,
  execute: (span: Span) => Promise<T> | T,
) {
  return runObservedOperation(request, {
    operation: options.useCase,
    resource: options.resource,
    action: options.action,
    endpointGroup: options.endpointGroup,
    spanName: options.spanName,
    spanAttributes: options.spanAttributes,
    logAttributes: options.logAttributes,
  }, execute)
}
