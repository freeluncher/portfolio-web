import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  // Hanya gunakan JWT untuk Vercel (Edge Compatibility & Security)
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Baca email dari env variable, amankan dari hardcode
      const adminEmail = process.env.ADMIN_EMAIL;

      if (!adminEmail) {
        console.error("ADMIN_EMAIL belum di-set di environment variables");
        return false;
      }

      // Bisa mendukung multiple emails yang dipisah koma (opsional)
      const allowedEmails = adminEmail.split(',').map(email => email.trim().toLowerCase());

      return allowedEmails.includes(user.email?.toLowerCase() ?? "");
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
