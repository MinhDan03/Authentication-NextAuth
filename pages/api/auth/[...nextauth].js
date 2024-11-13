import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "../../../lib/db";
import { verifyPassword } from "../../../lib/auth";

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: 'jwt',
      maxAge: 30 * 60, // Session hết hạn sau 30 phút
      updateAge: 24 * 60 * 60, // Làm mới sau 24 giờ // Thay thế 'jwt: true' bằng 'strategy: 'jwt''
    },
    providers: [
      CredentialsProvider({
        async authorize(credentials) {
          const client = await connectToDatabase();
          const usersCollection = client.db().collection('users');
  
          const user = await usersCollection.findOne({
            email: credentials.email,
          });
  
          if (!user) {
            client.close();
            throw new Error('No user found!');
          }
  
          const isValid = await verifyPassword(
            credentials.password,
            user.password
          );
  
          if (!isValid) {
            client.close();
            throw new Error('Could not log you in!');
          }
  
          client.close();
          return { email: user.email };
        },
      }),
    ],
    callbacks: {
        async jwt({ token, user }) {
          // Khi user tồn tại (đăng nhập thành công)
          if (user) {
            token.email = user.email;
          }
          return token;
        },
        async session({ session, token }) {
            if (token) {
              session.user.email = token.email; // Đảm bảo token.email tồn tại
            }
            return session;
          },
      }
    
  };
  
  export default NextAuth(authOptions);
