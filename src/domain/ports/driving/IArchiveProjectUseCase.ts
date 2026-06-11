export interface IArchiveProjectUseCase {
  execute(userId: string, projectId: string): Promise<void>;
}
