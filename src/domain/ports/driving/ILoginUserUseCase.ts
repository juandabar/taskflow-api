export interface ILoginUserInput {
  email: string;
  password: string;
}

export interface ILoginUserUseCase {
  execute(input: ILoginUserInput): Promise<string>;
}
