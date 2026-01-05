// JWT Token Payload Interface
export interface JwtPayload {
  userId: string;
  sid: string;
  email: string;
  name?: string;
  iamge?: string;
  roles?: string[];
  gtv: number;
  iat: number;
  exp?: number;
}
export interface UserDataFromDB {
  id: string;
  email: string;
  name?: string;
  image?: string;
  roles?: string[];
  emailVerified: boolean;
  password?: string;
  globalTokenVersion: number;
}

//User Login Payload Interface
export interface LoginPayload {
  // Credentials for user login
  email: string;
  password?: string; // Optional for OAuth logins
  // Additional user info for OAuth logins
  name?: string;
  image?: string;
  emailVerified?: boolean;
  provider?: string; //e.g google , github,credentials
}
export interface ApiResponse {
  status: number;
  message: string;
  user?: {
    email: string;
    name: string;
    image: string;
    roles: string;
    emailVerified: boolean;
  };
  data?: unknown;
}
export interface UserInfoPayload {
  user: {
    email: string;
    name?: string;
    image?: string;
    roles: string[];
    emailVerified: boolean;
  };
}
export interface AuthRequestUser{
  email: string;
    name?: string;
    image?: string;
    roles: string[];
    emailVerified: boolean;
    iat?: number;

}
