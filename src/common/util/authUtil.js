import  config  from "../../server/config";
import jwt from "jsonwebtoken";

export function generateToken(userId, role) {
  const payload = { userId, role };
  const secret = config.JWT_SECRET;
  return jwt.sign(payload, secret);
}
