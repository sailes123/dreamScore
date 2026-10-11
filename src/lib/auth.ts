import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
      if (!user || !(await compare(parsed.data.password, user.passwordHash))) return null;
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) token.role = user.role; return token; },
    session({ session, token }) { if (session.user) { session.user.id = token.sub!; session.user.role = token.role as string; } return session; },
  },
  pages: { signIn: '/login' },
});
