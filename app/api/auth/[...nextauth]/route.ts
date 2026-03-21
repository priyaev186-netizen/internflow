import NextAuth, { type Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const users = [
  { id: '1', name: 'Test User', email: 'test@example.com', password: 'password123', university: 'VTU', major: 'CSE', year: '3rd' }
];

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'test@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = users.find((u) => u.email === credentials?.email && u.password === credentials?.password);
        if (user) {
          return user;
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: Record<string, unknown>; user?: typeof users[number] }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          university: user.university,
          major: user.major,
          year: user.year
        };
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: Record<string, unknown> }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string | undefined,
          name: token.name as string | undefined,
          email: token.email as string | undefined,
          university: token.university as string | undefined,
          major: token.major as string | undefined,
          year: token.year as string | undefined
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/' // keep on home page
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
