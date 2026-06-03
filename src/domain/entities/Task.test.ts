import { describe, it, expect } from 'vitest';
import { Task } from './Task.js';
import { randomUUID } from 'node:crypto';
import { TASK_STATUS } from '../value-objects/TaskStatus.js';
import { PRIORITY } from '../value-objects/Priority.js';

const nowDate = new Date();

const postDate = new Date();
postDate.setMinutes(postDate.getMinutes() + 5);

const mockTask = {
  id: randomUUID(),
  title: 'title',
  description: 'description',
  projectId: 'projectId',
  assigneeId: 'assigneeId',
  status: TASK_STATUS.TODO,
  priority: PRIORITY.MEDIUM,
  dueDate: postDate,
  createdAt: nowDate,
};

describe('Task', () => {
  describe('create()', () => {
    it('should throw an error if the id is empty', () => {
      expect(() =>
        Task.create({
          ...mockTask,
          id: '',
        }),
      ).toThrow('id is required');
    });

    it('should throw an error if the title is empty', () => {
      expect(() =>
        Task.create({
          ...mockTask,
          title: '',
        }),
      ).toThrow('title is required');
    });

    it('should throw an error if the description is empty', () => {
      expect(() =>
        Task.create({
          ...mockTask,
          description: '',
        }),
      ).toThrow('description is required');
    });

    it('should throw an error if the projectId is empty', () => {
      expect(() =>
        Task.create({
          ...mockTask,
          projectId: '',
        }),
      ).toThrow('projectId is required');
    });

    it('should throw an error if dueDate is earlier than the current date', () => {
      const preDate = new Date();
      preDate.setMinutes(preDate.getMinutes() - 5);

      expect(() =>
        Task.create({
          ...mockTask,
          dueDate: preDate,
        }),
      ).toThrow('dueDate cannot be in the past');
    });

    it('should return the Task instance correctly', () => {
      const result = Task.create(mockTask);

      expect(result).toBeInstanceOf(Task);
    });
  });

  describe('assign()', () => {
    it('should throw an error if th userId is empty', () => {
      const project = Task.create(mockTask);

      expect(() => project.assign('')).toThrow('userId is required');
    });

    it('should perform the assignment correctly', () => {
      const project = Task.create(mockTask);

      project.assign('123-abc');

      expect(project.assigneeId).toBe('123-abc');
    });
  });

  describe('updateStatus()', () => {
    it('should throw an error if the state transition to in_progress is incorrect', () => {
      const project = Task.create({
        ...mockTask,
        status: TASK_STATUS.IN_PROGRESS,
      });

      expect(() => project.updateStatus(TASK_STATUS.IN_PROGRESS)).toThrow(
        `invalid state transition from state ${project.status} to state ${TASK_STATUS.IN_PROGRESS}`,
      );
    });

    it('should throw an error if the state transition to review is incorrect', () => {
      const project = Task.create({
        ...mockTask,
        status: TASK_STATUS.REVIEW,
      });

      expect(() => project.updateStatus(TASK_STATUS.REVIEW)).toThrow(
        `invalid state transition from state ${project.status} to state ${TASK_STATUS.REVIEW}`,
      );
    });

    it('should throw an error if the state transition to done is incorrect', () => {
      const project = Task.create({
        ...mockTask,
        status: TASK_STATUS.DONE,
      });

      expect(() => project.updateStatus(TASK_STATUS.DONE)).toThrow(
        `invalid state transition from state ${project.status} to state ${TASK_STATUS.DONE}`,
      );
    });

    it('should throw an error if the state transition to in_progress is incorrect', () => {
      const project = Task.create({
        ...mockTask,
        status: TASK_STATUS.DONE,
      });

      expect(() => project.updateStatus(TASK_STATUS.IN_PROGRESS)).toThrow(
        `invalid state transition from state ${project.status} to state ${TASK_STATUS.IN_PROGRESS}`,
      );
    });

    it('should perform the state transition to in_progress correctly', () => {
      const project = Task.create({
        ...mockTask,
        status: TASK_STATUS.TODO,
      });

      project.updateStatus(TASK_STATUS.IN_PROGRESS);

      expect(project.status).toBe(TASK_STATUS.IN_PROGRESS);
    });

    it('should perform the state transition to review correctly', () => {
      const project = Task.create({
        ...mockTask,
        status: TASK_STATUS.IN_PROGRESS,
      });

      project.updateStatus(TASK_STATUS.REVIEW);

      expect(project.status).toBe(TASK_STATUS.REVIEW);
    });

    it('should perform the state transition to done correctly', () => {
      const project = Task.create({
        ...mockTask,
        status: TASK_STATUS.REVIEW,
      });

      project.updateStatus(TASK_STATUS.DONE);

      expect(project.status).toBe(TASK_STATUS.DONE);
    });

    it('should allow transition from review back to in_progress', () => {
      const task = Task.create({ ...mockTask, status: TASK_STATUS.REVIEW });
      task.updateStatus(TASK_STATUS.IN_PROGRESS);
      expect(task.status).toBe(TASK_STATUS.IN_PROGRESS);
    });
  });
});
