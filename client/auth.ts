import CredentialsProvider from "next-auth/providers/credentials";
import { BACKEND_URL } from "./backendRoutes";
import axios from "axios";
import NextAuth from "next-auth";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          console.log("Received Credentials:", credentials);

          const loginRes = await axios.post(`${BACKEND_URL}/api/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          if (loginRes.status === 200) {
            const user = loginRes.data.user;
            return {
                id: user.id,
                username: user.username, // ✅ Ensure username is returned
                token: loginRes.data.token, // Ensure token is returned
              };
          }
        } catch (error) {
          console.error("Login failed:", error);
          throw new Error("Invalid credentials");
        }

        throw new Error("Authentication failed");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.username = user.username;
          token.accessToken = user.token; 
        }
        return token;
      },
  
    async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id;
          session.user.username = token.username; 
          session.user.token = token.accessToken; 
        }
        return session;
      },
  }
  
  
});
