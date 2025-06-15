export class User {
  readonly id: number;
  readonly email: string;
  readonly password: string;

  constructor(args: { id?: number; email: string; password: string }) {
    if (!args.email || !args.password) {
      throw new Error('email must be a string');
    }
    this.id = args.id;
    this.email = args.email;
    this.password = args.password;
  }
}
