
import _ from 'lodash';
import {Router} from 'express';
import jwt from "jsonwebtoken";
import {
    addNewUserHandler,
    deleteUserHandler,
    getUserDetailsHandler,
    getUserListHandler,
    updateUserDetailsHandler
} from '../../common/lib/user/userHandler';
import serverConfig from '../../server/config';
import responseStatus from "../../common/constants/responseStatus.json";
import responseData from "../../common/constants/responseData.json";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../../common/util/authUtil";
import userHelper from "../../common/helpers/user.helper";

const router = new Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.route('/list').post(async (req, res) => {
    try {
      let filter = {};
      filter.query = {};
  
      const inputData = { ...req.body };
      if (inputData) {
        filter.pageNum = inputData.pageNum ? inputData.pageNum : 1;
        filter.pageSize = inputData.pageSize ? inputData.pageSize : 50;
  
        if (inputData.filters) {
          filter.query = inputData.filters;
        }
      } else {
        filter.pageNum = 1;
        filter.pageSize = 50;
      }
  
      filter.query = { ...filter.query };
  
      const outputResult = await getUserListHandler(filter);
      res.status(responseStatus.STATUS_SUCCESS_OK);
      res.send({
        status: responseData.SUCCESS,
        data: {
          userList: outputResult.list ? outputResult.list : [],
          userCount: outputResult.count ? outputResult.count : 0,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(responseStatus.INTERNAL_SERVER_ERROR);
      res.send({
        status: responseData.ERROR,
        data: { message: err },
      });
    }
  });


router.route('/new').post(async (req, res) => {
    try {
       if (!_.isEmpty(req.body)) {
            const outputResult = await addNewUserHandler(req.body.user);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    user: outputResult ? outputResult : {}
                }
            });
        } else {
            throw 'no request body sent'
        }
    } catch (err) {
        console.log(err)
        res.status(responseStatus.INTERNAL_SERVER_ERROR);
        res.send({
            status: responseData.ERROR,
            data: { message: err }
        });
    }
});

router.route('/me').get(async (req, res) => {
    try {
        console.log("Authorization Header:", req.headers.authorization);

        // Check if the Authorization header is present
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({
                status: responseData.ERROR,
                data: { message: "Authorization token missing or invalid" },
            });
        }

        // Extract the token
        const token = authHeader.split(" ")[1];
        console.log("Token:", token);

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, serverConfig.JWT_SECRET); // Use serverConfig.JWT_SECRET
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).send({
                status: responseData.ERROR,
                data: { message: "Invalid or expired token" },
            });
        }
        console.log("Decoded Token:", decoded);

        // Fetch the user details
        const gotUser = await getUserDetailsHandler({ id: decoded.userId });
        console.log("Fetched User:", gotUser);

        if (!gotUser) {
            return res.status(404).send({
                status: responseData.ERROR,
                data: { message: "User not found" },
            });
        }

        // Send the user details
        res.status(responseStatus.STATUS_SUCCESS_OK).send({
            status: responseData.SUCCESS,
            data: { user: gotUser },
        });
    } catch (err) {
        console.error("Error in /me route:", err);
        res.status(responseStatus.INTERNAL_SERVER_ERROR).send({
            status: responseData.ERROR,
            data: { message: "Internal server error" },
        });
    }
});


router.post("/google-auth-sigin", async (req, res) => {
    try {
        console.log("Received request for /google-auth-sigin");
        const { idToken } = req.body;
        if (!idToken) {
            console.error("idToken missing in request body");
            return res.status(400).json({ status: responseData.ERROR, data: { message: "idToken is required" } });
        }

        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken,
                audience: GOOGLE_CLIENT_ID,
            });
            console.log("Google ID token verified successfully");
        } catch (verifyErr) {
            console.error("Error verifying Google ID token:", verifyErr);
            return res.status(401).json({ status: responseData.ERROR, data: { message: "Invalid Google ID token" } });
        }

        const payload = ticket.getPayload();
        console.log("Google payload:", payload);

        let user;
        try {
            user = await userHelper.getObjectByQuery({ query: { email: payload.email } });
            console.log("User fetched from DB:", user);
        } catch (dbFetchErr) {
            console.error("Error fetching user from DB:", dbFetchErr);
            return res.status(500).json({ status: responseData.ERROR, data: { message: "Error fetching user" } });
        }

        if (!user) {
            try {
                user = await userHelper.addObject({
                    name: payload.name,
                    email: payload.email,
                    username: payload.email.split("@")[0],
                    profile_pic: payload.picture,
                });
                console.log("New user created:", user);
            } catch (dbAddErr) {
                console.error("Error creating new user:", dbAddErr);
                return res.status(500).json({ status: responseData.ERROR, data: { message: "Error creating user" } });
            }
        }

        let token;
        try {
            token = generateToken({ userId: user._id, role: "user" }, "user");
            console.log("JWT generated for user:", token);
        } catch (tokenErr) {
            console.error("Error generating JWT:", tokenErr);
            return res.status(500).json({ status: responseData.ERROR, data: { message: "Error generating token" } });
        }

        res.status(200).json({
            status: responseData.SUCCESS,
            data: { user, token },
        });
    } catch (err) {
        console.error("Unhandled error in /google-auth-sigin:", err);
        res.status(500).json({ status: responseData.ERROR, data: { message: err.message || err } });
    }
});

router.route('/:id').get(async (req, res) => {
    try {
        if (req.params.id) {
            const gotUser = await getUserDetailsHandler(req.params);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    user: gotUser ? gotUser : {}
                }
            });
        } else {
            throw 'no id param sent'
        }
    } catch (err) {
        console.log(err)
        res.status(responseStatus.INTERNAL_SERVER_ERROR);
        res.send({
            status: responseData.ERROR,
            data: { message: err }
        });
    }
});

router.route('/:id/update').post( async (req, res) => {
    try {
        if (!_.isEmpty(req.params.id) && !_.isEmpty(req.body) && !_.isEmpty(req.body.user)) {
            let input = {
                objectId: req.params.id,
                updateObject: req.body.user
            }
            const updateObjectResult = await updateUserDetailsHandler(input);
            res.status(responseStatus.STATUS_SUCCESS_OK);
                res.send({
                    status: responseData.SUCCESS,
                    data: {
                        user: updateObjectResult ? updateObjectResult : {}
                    }
                });
        } else {
            throw 'no body or id param sent'
        }
    } catch (err) {
        console.log(err)
        res.status(responseStatus.INTERNAL_SERVER_ERROR);
        res.send({
            status: responseData.ERROR,
            data: { message: err }
        });
    }
});

router.route('/:id/remove').post(async(req, res) => {
    try {
        if (req.params.id) {
            const deletedUser = await deleteUserHandler(req.params.id);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    hasUserDeleted: true
                }
            });
        } else {
            throw 'no id param sent'
        }
    } catch (err) {
        console.log(err)
        res.status(responseStatus.INTERNAL_SERVER_ERROR);
        res.send({
            status: responseData.ERROR,
            data: { message: err }
        });
    }
});

export default router;
  
