export class Product {
  readonly id: number;
  readonly name: string;
  readonly description: string;

  constructor(args: { id?: number; name: string; description?: string }) {
    this.id = args.id;
    this.name = args.name;
    this.description = args.description;
  }

  public static create(args: { id?: number; name: string; description?: string }) {
    if (!args.name) {
      throw new Error('제품 이름은 필수입니다.');
    }
    return new Product(args);
  }
}
