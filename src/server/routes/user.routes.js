
import _ from 'lodash';
import { Router } from 'express';
import jwt from "jsonwebtoken";
import multer from 'multer';
import {
    addNewUserHandler,
    deleteUserHandler,
    getUserDetailsHandler,
    getUserListHandler,
    updateUserDetailsHandler,
    getUserDetailsHandlerV2,
    userSignUpHandler,
    verifyOtpAndCreateUserHandler,
    userCompanyCreditCheck
} from '../../common/lib/user/userHandler';
import serverConfig from '../../server/config';
import responseStatus from "../../common/constants/responseStatus.json";
import responseData from "../../common/constants/responseData.json";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../../common/util/authUtil";
import userHelper from "../../common/helpers/user.helper";
import { getTherapistsForUser } from '../../common/lib/user/userHandler';
import { storage } from "../../util/cloudinary.js";
import companyHelper from '../../common/helpers/company.helper.js';

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

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
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({
                status: responseData.ERROR,
                data: { message: "Authorization token missing or invalid" },
            });
        }

        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, serverConfig.JWT_SECRET);
        } catch (err) {
            return res.status(401).send({
                status: responseData.ERROR,
                data: { message: "Invalid or expired token" },
            });
        }


        const userId = decoded.userId;
        if (!userId || typeof userId !== 'string') {
            return res.status(401).send({
                status: responseData.ERROR,
                data: { message: "Invalid token structure" },
            });
        }

        const gotUser = await getUserDetailsHandlerV2({ id: userId });
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


router.post("/google-signup", async (req, res) => {
    const { idToken, role } = req.body;

    if (!idToken) {
        return res.status(400).json({
            status: responseData.ERROR,
            data: { message: "ID token is required" }
        });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const {
            sub: googleId,
            email,
            given_name: firstName,
            family_name: lastName,
            picture: profilePicture,
            email_verified: emailVerified
        } = payload;

        let user = await userHelper.getObjectByQuery({
            query: { $or: [{ googleId }, { email }] }
        });

        if (!user) {
            let username;
            let isUnique = false;
            let attempts = 0;

            while (!isUnique && attempts < 10) {
                username = `${firstName}${lastName}${Math.floor(Math.random() * 10000)}`;
                const existingUser = await userHelper.getObjectByQuery({ query: { username } });
                if (!existingUser) isUnique = true;
                attempts++;
            }

            user = await userHelper.addObject({
                googleId,
                email,
                role: role || "user",
                name: `${firstName} ${lastName}`,
                profile_image: profilePicture,
                emailVerified,
                username,
                password: "google-oauth",
            });
        }

        const tokenPayload = {
            userId: user._id.toString(),
            role: "user"
        };

        const token = jwt.sign(tokenPayload, serverConfig.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            status: responseData.SUCCESS,
            data: {
                message: "Signup successful",
                user,
                token
            }
        });
    } catch (error) {
        console.error("Google Signup Error:", error);
        return res.status(500).json({
            status: responseData.ERROR,
            data: { message: "Internal server error" }
        });
    }
});

router.post("/google-auth-sigin", async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({
            status: responseData.ERROR,
            data: { message: "ID token is required" }
        });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const {
            sub: googleId,
            email,
        } = payload;

        const user = await userHelper.getObjectByQuery({
            query: { $or: [{ googleId }, { email }] }
        });

        if (!user) {
            return res.status(404).json({
                status: responseData.ERROR,
                data: { message: "User not found" }
            });
        }

        const tokenPayload = {
            userId: user._id.toString(),
            role: "user" // Add role directly to payload
        };
        const token = jwt.sign(tokenPayload, serverConfig.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            status: responseData.SUCCESS,
            data: {
                message: "Login successful",
                user,
                token
            }
        });
    } catch (error) {
        console.error("Google Login Error:", error);
        return res.status(500).json({
            status: responseData.ERROR,
            data: { message: "Internal server error" }
        });
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

router.get('/:userId/therapists', async (req, res) => {
    try {
        const therapists = await getTherapistsForUser(req.params.userId);
        res.status(responseStatus.STATUS_SUCCESS_OK).send({
            status: responseData.SUCCESS,
            data: { therapists }
        });
    } catch (err) {
        res.status(responseStatus.INTERNAL_SERVER_ERROR).send({
            status: responseData.ERROR,
            data: { message: err }
        });
    }
});

router.route('/:id/update').post(upload.fields([{ name: 'img', maxCount: 5 }]), async (req, res) => {
    try {
        if (!_.isEmpty(req.params.id) && !_.isEmpty(req.body)) {

            const files = req.files;
            let input = {
                objectId: req.params.id,
                updateObject: req.body,
                files
            };
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

router.route('/:id/remove').post(async (req, res) => {
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

router.route('/signup/send-otp').post(async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                status: responseData.ERROR,
                data: { message: "Email is required" }
            });
        }
        
        const result = await userSignUpHandler({ body: { email } });
        
        res.status(responseStatus.STATUS_SUCCESS_OK).json({
            status: responseData.SUCCESS,
            data: result
        });
        
    } catch (err) {
        console.log(err);
        res.status(responseStatus.INTERNAL_SERVER_ERROR).json({
            status: responseData.ERROR,
            data: { message: err.message || err }
        });
    }
});

// Route to verify OTP and create user
router.route('/signup/verify-otp').post(async (req, res) => {
    try {
        const { email, otp, userData } = req.body;
        
        console.log("Received verification request:", { email, otp: otp ? "***" : "missing", userData: userData ? "provided" : "missing" });
        
        if (!email || !otp) {
            return res.status(400).json({
                status: responseData.ERROR,
                data: { message: "Email and OTP are required" }
            });
        }
        
        if (!userData || !userData.name) {
            return res.status(400).json({
                status: responseData.ERROR,
                data: { message: "User data with name is required" }
            });
        }
        
        const result = await verifyOtpAndCreateUserHandler({ email, otp, userData });
        
        res.status(responseStatus.STATUS_SUCCESS_OK).json({
            status: responseData.SUCCESS,
            data: result
        });
        
    } catch (err) {
        console.error("Route error:", err);
        res.status(responseStatus.INTERNAL_SERVER_ERROR).json({
            status: responseData.ERROR,
            data: { message: err.message || "OTP verification failed" }
        });
    }
});

router.route('/:id/check-company-credits').get(async(req,res)=>{
    try{
        if(req.params.id)
        {
            const creditCheckResult = await userCompanyCreditCheck(req.params.id);
            res.status(responseStatus.STATUS_SUCCESS_OK).json({
                status: responseData.SUCCESS,
                data: {
                    creditCheck: creditCheckResult
                }
            });
        }
    }
    catch(err)
    {
        console.log("Error on Checking Credits:",err);
        res.status(responseStatus.INTERNAL_SERVER_ERROR).json({
            status: responseData.ERROR,
            data: { message: err.message || "Company credit check failed" }
        });
    }
})

export default router;

