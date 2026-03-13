import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (userRole: string): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 1, email: 'test@example.com', role: userRole } }),
      }),
    }) as unknown as ExecutionContext;

  it('should allow access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext('customer');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has a required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin', 'customer']);
    const context = createMockContext('customer');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow admin access to admin-only routes', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockContext('admin');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny customer access to admin-only routes', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockContext('customer');
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
