import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit:action';
export const AUDIT_RESOURCE_KEY = 'audit:resource';

export const Audit = (action: string, resourceType: string) =>
  (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    SetMetadata(AUDIT_ACTION_KEY, action)(target, key!, descriptor!);
    SetMetadata(AUDIT_RESOURCE_KEY, resourceType)(target, key!, descriptor!);
  };