import _ from "lodash";
import { Router } from "express";
import {
  userSignupHandler,
  userLoginHandler,
  verifyUserOtpHandler,
  getUserByEmailHandler
} from "../../common/lib/auth/authHandler";
import responseStatus from "../../common/constants/responseStatus.json";
import responseData from "../../common/constants/responseData.json";
import {generateOtp,generateOtpExpireDate, mailsender} from "../../common/util/utilHelper";
import {updateUserOtpHandler} from "../../common/lib/user/userHandler";

const router = new Router();

router.route("/signup").post(async (req, res) => {
  try {
    const result = await userSignupHandler(req.body);
    res.status(responseStatus.STATUS_SUCCESS_OK).json({
      status: responseData.SUCCESS,
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(responseStatus.INTERNAL_SERVER_ERROR).json({
      status: responseData.ERROR,
      data: { message: err.message || err },
    });
  }
});

router.route("/login").post(async (req, res) => {
  try {
    const result = await userLoginHandler(req.body);
    res.status(responseStatus.STATUS_SUCCESS_OK).json({
      status: responseData.SUCCESS,
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(responseStatus.INTERNAL_SERVER_ERROR).json({
      status: responseData.ERROR,
      data: { message: err.message || err },
    });
  }
});

router.route("/test-mail").post(async (req, res) => {
  try {        
    const { email} = req.body;
    if (!email) {
        throw 'Email is required';
    }
    const gotUser = await getUserByEmailHandler({ email});
    console.log(gotUser+": User");
    if (!gotUser) {
        return res.status(responseStatus.STATUS_UNAUTHORIZED).send({
            status: responseData.ERROR,
            data: { message: 'Invalid email or password' }
        });
    }
    console.log(gotUser.name);
    const otp = generateOtp(6);
    const expiry = generateOtpExpireDate();
    
    await updateUserOtpHandler(gotUser._id, otp, expiry);
    
    // Send OTP email
    await mailsender(gotUser.name, gotUser.email,otp);
    
    res.status(responseStatus.STATUS_SUCCESS_OK).send({
        status: responseData.SUCCESS,
        data: { user: gotUser }
    });
}
catch(err){
    console.log(err)
    res.status(responseStatus.INTERNAL_SERVER_ERROR);
    res.send({
        status: responseData.ERROR,
        data: { message: err }
    });
}
});

router.route("/verify-email-otp").post(async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw "Email and OTP are required";
    }
    const user = await verifyUserOtpHandler(email, otp);
    return res.status(200).json({
      status: responseData.SUCCESS,
      data: {
        message: "OTP verified successfully",
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(responseStatus.INTERNAL_SERVER_ERROR).json({
      status: responseData.ERROR,
      data: { message: err.message || err },
    });
  }
});

export default router;
