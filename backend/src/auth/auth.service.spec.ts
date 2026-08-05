import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwtService: JwtService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') } as unknown as JwtService;
    service = new AuthService(prisma as unknown as PrismaService, jwtService);
  });

  describe('register', () => {
    it('hashes the password and creates a new user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'user-1', email: data.email, password: data.password }),
      );

      const result = await service.register({ email: 'a@b.com', password: 'password123' });

      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      const createdPassword = prisma.user.create.mock.calls[0][0].data.password;
      expect(createdPassword).not.toBe('password123');
      await expect(bcrypt.compare('password123', createdPassword)).resolves.toBe(true);

      expect(result).toEqual({
        accessToken: 'signed.jwt.token',
        user: { id: 'user-1', email: 'a@b.com' },
      });
    });

    it('rejects when the email is already taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing', email: 'a@b.com' });

      await expect(service.register({ email: 'a@b.com', password: 'password123' })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns an access token for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 4);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'a@b.com', password: passwordHash });

      const result = await service.login({ email: 'a@b.com', password: 'password123' });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user).toEqual({ id: 'user-1', email: 'a@b.com' });
    });

    it('rejects an unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'nobody@b.com', password: 'x' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'a@b.com', password: passwordHash });

      await expect(service.login({ email: 'a@b.com', password: 'wrong-password' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
