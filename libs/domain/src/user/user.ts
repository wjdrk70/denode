export class User {
  readonly id: number;
  readonly email: string;
  readonly password: string;

  private constructor(args: { id?: number; email: string; password: string }) {
    this.id = args.id;
    this.email = args.email;
    this.password = args.password;
  }

  public static create(args: { id?: number; email: string; password: string }): User {
    if (!args.email || !args.password) {
      throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
    }
    return new User(args);
  }
}
