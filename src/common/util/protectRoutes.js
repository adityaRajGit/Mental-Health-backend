import jwt from "jsonwebtoken";
import serverConfig from "../../server/config";
import { ADMIN, EVENTMANAGER, SUPERADMIN } from "../constants/enum";
import adminHelper from "../helpers/admin.helper";

function authenticateToken(req, res, next) {
  let token = req.headers.authorization;
  if (token) {
    token = token.split(" ")[1];
    jwt.verify(token, serverConfig.JWT_SECRET, (err, payload) => {
      if (err) {
        res.status(403).json({
          message: "Unauthorized Access",
        });
      } else {
        req.user = payload;
        next();
      }
    });
  } else {
    res.status(403).json({
      message: "Unauthorized Access",
    });
  }
}

async function verifyAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(403)
        .json({ message: "Access Denied: No token provided" });
    }

    const decoded = jwt.verify(token, serverConfig.JWT_SECRET);
    const adminId = decoded.userId;

    const admin = await adminHelper.getObjectById({ id: adminId });

    if (!admin || ![ADMIN, SUPERADMIN, EVENTMANAGER].includes(admin.role)) {
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Error in verifyAdmin middleware:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}

const protectRoutes = {
  authenticateToken: authenticateToken,
  verifyAdmin: verifyAdmin,
};

export default protectRoutes;
