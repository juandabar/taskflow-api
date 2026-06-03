import { describe, it, expect } from 'vitest';
import { Project } from './Project.js';
import { randomUUID } from 'node:crypto';
import { PROJECT_STATUS } from '../value-objects/ProjectStatus.js';

const mockProject = {
  id: randomUUID(),
  name: 'name',
  description: 'description',
  ownerId: 'ownerId',
  status: PROJECT_STATUS.ACTIVE,
  createdAt: new Date(),
};

describe('Project', () => {
  describe('create()', () => {
    it('should throw an error if the id arrives empty', () => {
      expect(() => Project.create({ ...mockProject, id: '' })).toThrow('id is required');
    });

    it('should throw an error if the name arrives empty', () => {
      expect(() => Project.create({ ...mockProject, name: '' })).toThrow('name is required');
    });

    it('should throw an error if the description arrives empty', () => {
      expect(() => Project.create({ ...mockProject, description: '' })).toThrow(
        'description is required',
      );
    });

    it('should throw an error if the ownerId arrives empty', () => {
      expect(() => Project.create({ ...mockProject, ownerId: '' })).toThrow('ownerId is required');
    });

    it('should create the Project instance and return it', () => {
      const result = Project.create(mockProject);
      expect(result).toBeInstanceOf(Project);
    });
  });

  describe('archive()', () => {
    it('should throw an error if the project was already archived', () => {
      const result = Project.create({
        ...mockProject,
        status: PROJECT_STATUS.ARCHIVED,
      });

      expect(() => result.archive()).toThrow('the project is already archived');
    });

    it('should change the status from active to archived', () => {
      const result = Project.create(mockProject);

      result.archive();

      expect(result.status).toBe(PROJECT_STATUS.ARCHIVED);
    });
  });

  describe('canAddTasks()', () => {
    it('should return false if tasks cannot be added to the project', () => {
      const project = Project.create({
        ...mockProject,
        status: PROJECT_STATUS.ARCHIVED,
      });

      const result = project.canAddTasks();

      expect(result).toBe(false);
    });

    it('should return true if the project can have new tasks', () => {
      const project = Project.create(mockProject);

      const result = project.canAddTasks();

      expect(result).toBe(true);
    });
  });
});
