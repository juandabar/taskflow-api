import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { USER_ROLE } from '../value-objects/UserRole.js';
import { User } from './User.js';

const mockUser = {
  id: randomUUID(),
  name: 'name',
  email: 'email@email.com',
  passwordHash: 'passwordHash',
  role: USER_ROLE.MEMBER,
  createdAt: new Date(),
};

describe('User', () => {
  describe('create()', () => {
    it('should throw an error if the email does not comply with the email address format', () => {
      expect(() =>
        User.create({
          ...mockUser,
          email: 'email',
        }),
      ).toThrow('Invalid email format');
    });

    it('should throw an error if the id is empty', () => {
      expect(() =>
        User.create({
          ...mockUser,
          id: '',
        }),
      ).toThrow('id is required');
    });

    it('should throw an error if the id name empty', () => {
      expect(() =>
        User.create({
          ...mockUser,
          name: '',
        }),
      ).toThrow('name is required');
    });

    it('should throw an error if the passwordHash name empty', () => {
      expect(() =>
        User.create({
          ...mockUser,
          passwordHash: '',
        }),
      ).toThrow('passwordHash is required');
    });
  });
});
