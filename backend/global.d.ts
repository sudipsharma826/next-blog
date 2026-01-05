// when ever we use req.user in our express app, it will have the type of Prisma User
// Primsa User plus any additional fields defined in AuthDto 
import { User as PrismaUser} from "./generated/prisma/client"
import { AuthDto } from "./src/auth/auth.dto";
declare global {
  namespace Express {
    interface User extends AuthDto {}
    interface Request {
      user?: User;
    }
  }
}