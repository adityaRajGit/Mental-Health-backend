
import _ from 'lodash';
import { Router } from 'express';

import {
    addNewOtpHandler,
    deleteOtpHandler,
    getOtpDetailsHandler,
    getOtpListHandler,
    updateOtpDetailsHandler
} from '../../common/lib/otp/otpHandler';
import responseStatus from "../../common/constants/responseStatus.json";
import responseData from "../../common/constants/responseData.json";
import userHelper from '../../common/helpers/user.helper';
import therapistHelper from '../../common/helpers/therapist.helper';
import { sendVerificationEmail, verifyEmailOTP } from '../../common/util/utilHelper';

const router = new Router();

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

        const outputResult = await getOtpListHandler(filter);
        res.status(responseStatus.STATUS_SUCCESS_OK);
        res.send({
            status: responseData.SUCCESS,
            data: {
                otpList: outputResult.list ? outputResult.list : [],
                otpCount: outputResult.count ? outputResult.count : 0,
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
            const outputResult = await addNewOtpHandler(req.body.otp);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    otp: outputResult ? outputResult : {}
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

router.route('/:id').get(async (req, res) => {
    try {
        if (req.params.id) {
            const gotOtp = await getOtpDetailsHandler(req.params);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    otp: gotOtp ? gotOtp : {}
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

router.route('/:id/update').post(async (req, res) => {
    try {
        if (!_.isEmpty(req.params.id) && !_.isEmpty(req.body) && !_.isEmpty(req.body.otp)) {
            let input = {
                objectId: req.params.id,
                updateObject: req.body.otp
            }
            const updateObjectResult = await updateOtpDetailsHandler(input);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    otp: updateObjectResult ? updateObjectResult : {}
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
            const deletedOtp = await deleteOtpHandler(req.params.id);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    hasOtpDeleted: true
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


router.route("/send-email-otp").post(async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw "Email is required";
        }

        let user;

        user = await userHelper.getObjectByQuery({
            query: { email },
        })

        if (!user) {
            user = await therapistHelper.getObjectByQuery({
                query: { email },
            })
        }

        if (user) {
            throw "This email is already exists";
        }

        await sendVerificationEmail(email, "Email Verification OTP");

        res.status(responseStatus.STATUS_SUCCESS_OK).json({
            status: responseData.SUCCESS,
            message: "OTP sent successfully",
        });
    } catch (err) {
        console.log(err);
        res.status(responseStatus.INTERNAL_SERVER_ERROR).json({
            status: responseData.ERROR,
            message: err.message || err,
        });
    }
});

router.route("/verify-email-otp").post(async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            throw "Email and OTP are required";
        }

        const result = await verifyEmailOTP(email, otp);

        res.status(responseStatus.STATUS_SUCCESS_OK).json({
            status: responseData.SUCCESS,
            message: result.message,
        });
    } catch (err) {
        console.error(err);
        res.status(responseStatus.INTERNAL_SERVER_ERROR).json({
            status: responseData.ERROR,
            message: err.message || err,
        });
    }
});

export default router;

