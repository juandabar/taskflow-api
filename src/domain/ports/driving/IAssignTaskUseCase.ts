export interface IAssignTaskUseCase {
  execute(taskId: string, userId: string): Promise<void>;
}
