import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

import { BcryptPasswordHasher } from '../adapters/driven/security/BcryptPasswordHasher.js';
import { JwtService } from '../adapters/driven/security/JwtService.js';

import { DrizzleProjectRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleProjectRepository.js';
import { DrizzleUserRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleUserRepository.js';

import { LoginUserUseCase } from '../domain/use-cases/auth/LoginUserUseCase.js';
import { RegisterUserUseCase } from '../domain/use-cases/auth/RegisterUserUseCase.js';
import { ListUsersUseCase } from '../domain/use-cases/user/ListUsersUseCase.js';

import { ProjectController } from '../adapters/driving/http/controllers/ProjectController.js';
import { UserController } from '../adapters/driving/http/controllers/UserController.js';

import { preHandlerAsyncHookHandler } from 'fastify';
import { DrizzleCommentRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleCommentRepository.js';
import { DrizzleTaskRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleTaskRepository.js';
import { CommentController } from '../adapters/driving/http/controllers/CommentController.js';
import { TaskController } from '../adapters/driving/http/controllers/TaskController.js';
import { createAuthGuard } from '../adapters/driving/http/middlewares/authGuard.js';
import { AddCommentUseCase } from '../domain/use-cases/comment/AddCommentUseCase.js';
import { DeleteCommentUseCase } from '../domain/use-cases/comment/DeleteCommentUseCase.js';
import { ArchiveProjectUseCase } from '../domain/use-cases/project/ArchiveProjectUseCase.js';
import { CreateProjectUseCase } from '../domain/use-cases/project/CreateProjectUseCase.js';
import { GetProjectByIdUseCase } from '../domain/use-cases/project/GetProjectByIdUseCase.js';
import { ListProjectsUseCase } from '../domain/use-cases/project/ListProjectsUseCase.js';
import { AssignTaskUseCase } from '../domain/use-cases/task/AssignTaskUseCase.js';
import { CreateTaskUseCase } from '../domain/use-cases/task/CreateTaskUseCase.js';
import { GetTaskByIdUseCase } from '../domain/use-cases/task/GetTaskByIdUseCase.js';
import { ListTasksByProjectUseCase } from '../domain/use-cases/task/ListTasksByProjectUseCase.js';
import { UpdateTaskStatusUseCase } from '../domain/use-cases/task/UpdateTaskStatusUseCase.js';
import { GetUserByIdUseCase } from '../domain/use-cases/user/GetUserByIdUseCase.js';

interface IContainer {
  authGuard: preHandlerAsyncHookHandler;
  userController: UserController;
  projectController: ProjectController;
  taskController: TaskController;
  commentController: CommentController;
}

export function createContainer(db: BetterSQLite3Database): IContainer {
  const jwtService = new JwtService();
  const passwordHasher = new BcryptPasswordHasher();

  // repositories
  const userRepository = new DrizzleUserRepository(db);
  const projectRepository = new DrizzleProjectRepository(db);
  const taskRepository = new DrizzleTaskRepository(db);
  const commentRepository = new DrizzleCommentRepository(db);

  // use cases - Users
  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
  const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, jwtService);
  const listUsersUseCase = new ListUsersUseCase(userRepository);
  const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);

  // use cases - Projects
  const createProjectUseCase = new CreateProjectUseCase(projectRepository);
  const listProjectsUseCase = new ListProjectsUseCase(projectRepository);
  const getProjectByIdUseCase = new GetProjectByIdUseCase(projectRepository);
  const archiveProjectUseCase = new ArchiveProjectUseCase(projectRepository);

  // use cases - Tasks
  const createTaskUseCase = new CreateTaskUseCase(taskRepository, projectRepository);
  const listTasksByProjectUseCase = new ListTasksByProjectUseCase(
    taskRepository,
    projectRepository,
  );
  const getTaskByIdUseCase = new GetTaskByIdUseCase(taskRepository);
  const assignTaskUseCase = new AssignTaskUseCase(taskRepository);
  const updateTaskStatusUseCase = new UpdateTaskStatusUseCase(taskRepository);

  // use cases - comments
  const addCommentUseCase = new AddCommentUseCase(commentRepository, taskRepository);
  const deleteCommentUseCase = new DeleteCommentUseCase(commentRepository, userRepository);
  // controller instances
  const userController = new UserController(
    registerUserUseCase,
    loginUserUseCase,
    listUsersUseCase,
    getUserByIdUseCase,
  );
  const projectController = new ProjectController(
    createProjectUseCase,
    listProjectsUseCase,
    getProjectByIdUseCase,
    archiveProjectUseCase,
  );
  const taskController = new TaskController(
    createTaskUseCase,
    listTasksByProjectUseCase,
    getTaskByIdUseCase,
    assignTaskUseCase,
    updateTaskStatusUseCase,
  );
  const commentController = new CommentController(addCommentUseCase, deleteCommentUseCase);
  const authGuard = createAuthGuard(jwtService);

  return {
    authGuard,
    commentController,
    projectController,
    taskController,
    userController,
  };
}
