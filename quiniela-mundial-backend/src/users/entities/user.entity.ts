import { Role, User as PrismaUser } from '@prisma/client';

export class User implements Omit<PrismaUser, 'password'> {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;

  static fromPrisma(user: PrismaUser): User {
    const { password: _password, ...safeUser } = user;
    return safeUser as User;
  }
}
