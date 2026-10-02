import jwt, { JwtPayload } from "jsonwebtoken";
import ms from "ms";
import { UserRole } from "../../generated/enums";

export const createToken = (
  jwtPayload: {
    id: string;
    role: UserRole;
    email: string;
  },
  secret: string,
  expiresIn: ms.StringValue,
) => {
  return jwt.sign(jwtPayload, secret, { expiresIn });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
