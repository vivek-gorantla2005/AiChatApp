declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      token: string; // Store Bearer Token
    };
  }

  interface User {
    id: string;
    username: string;
    token: string; // Include Token from API Response
  }
}
