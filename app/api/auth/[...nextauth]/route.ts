import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findUserByEmail, createUser, verifyPassword } from '@/lib/db';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        let user = await findUserByEmail(credentials.email);

        if (!user) {
          const newUser = await createUser({
            name: credentials.name || credentials.email.split('@')[0],
            email: credentials.email,
            password: credentials.password,
            provider: 'credentials',
          });
          return { id: newUser.id, name: newUser.name, email: newUser.email, image: newUser.image };
        }

        const valid = await verifyPassword(credentials.email, credentials.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        const existing = await findUserByEmail(user.email);
        if (!existing) {
          await createUser({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account.provider,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || 'candyai-dev-secret-change-in-production',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
