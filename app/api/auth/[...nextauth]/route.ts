import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const users = [
  { id: '1', name: 'Test User', email: 'test@example.com', password: 'password123' }
];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'test@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        const user = users.find((u) => u.email === credentials?.email && u.password === credentials?.password);
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/'
  }
});

export { handler as GET, handler as POST };
