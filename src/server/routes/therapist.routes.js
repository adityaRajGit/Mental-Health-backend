
import _ from 'lodash';
import { Router } from 'express';
import multer from 'multer';
import {
    addNewTherapistHandler,
    deleteTherapistHandler,
    getTherapistDetailsHandler,
    getTherapistListHandler,
    updateTherapistDetailsHandler,
    updateTherapistDetailsHandlerV2,
    addNewTherapistHandlerV2,
    therapistSignupHandler,
    therapistLoginHandler,
    calculateTherapistProfileCompletion,
    recommendTherapistsHandler
} from '../../common/lib/therapist/therapistHandler';
import responseStatus from "../../common/constants/responseStatus.json";
import responseData from "../../common/constants/responseData.json";
import { storage } from "../../util/cloudinary.js";

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });
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

        const outputResult = await getTherapistListHandler(filter);
        res.status(responseStatus.STATUS_SUCCESS_OK);
        res.send({
            status: responseData.SUCCESS,
            data: {
                therapistList: outputResult.list ? outputResult.list : [],
                therapistCount: outputResult.count ? outputResult.count : 0,
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


router.route("/recommend").post(async (req, res) => {
    try {
        const result = await recommendTherapistsHandler(req.body);
        res.status(responseStatus.STATUS_SUCCESS_OK).send({
            status: responseData.SUCCESS,
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(responseStatus.INTERNAL_SERVER_ERROR).send({
            status: responseData.ERROR,
            data: { message: err.message || err }
        });
    }
});

router.route("/signup").post(async (req, res) => {
    try {
        const result = await therapistSignupHandler(req.body);
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
        const result = await therapistLoginHandler(req.body);
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

router.route('/new').post(async (req, res) => {
    try {
        if (!_.isEmpty(req.body)) {
            const outputResult = await addNewTherapistHandler(req.body.therapist);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    therapist: outputResult ? outputResult : {}
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

router.post("/add-therapist", upload.fields([{ name: "img", maxCount: 5 }]), async (req, res) => {
    try {
        let therapistData = req.body.therapist || req.body;
        if (typeof therapistData === 'string') {
            therapistData = JSON.parse(therapistData);
        }

        const files = req.files;
        const inputData = { ...therapistData, files };

        const outputResult = await addNewTherapistHandlerV2(inputData);
        res.status(200).send({
            status: "SUCCESS",
            data: { therapist: outputResult || {} }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: "ERROR", data: { message: err.message } });
    }
});

router.get('/:id/profile-completion', async (req, res) => {
    try {
        const therapist = await getTherapistDetailsHandler({ id: req.params.id });
        if (!therapist) {
            return res.status(404).json({
                status: "Error",
                data: { message: "Therapist not found" }
            });
        }
        const percent = calculateTherapistProfileCompletion(therapist);
        res.status(200).json({
            status: "Success",
            data: { percent }
        });
    } catch (err) {
        res.status(500).json({
            status: "Error",
            data: { message: err.message }
        });
    }
});

router.route('/:id').get(async (req, res) => {
    try {
        if (req.params.id) {
            const gotTherapist = await getTherapistDetailsHandler(req.params);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    therapist: gotTherapist ? gotTherapist : {}
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

router.post('/:id/update', upload.fields([{ name: 'img', maxCount: 5 }]), async (req, res) => {
    try {
        if (!_.isEmpty(req.params.id) && req.body) {
            let therapistData = req.body;
            if (typeof therapistData === 'string') {
                therapistData = JSON.parse(therapistData);
            }
            const files = req.files;
            let input = {
                objectId: req.params.id,
                updateObject: therapistData,
                files
            };
            const updateObjectResult = await updateTherapistDetailsHandlerV2(input);
            res.status(responseStatus.STATUS_SUCCESS_OK).send({
                status: responseData.SUCCESS,
                data: {
                    therapist: updateObjectResult ? updateObjectResult : {}
                }
            });
        } else {
            throw 'no body or id param sent';
        }
    } catch (err) {
        console.log(err);
        res.status(responseStatus.INTERNAL_SERVER_ERROR).send({
            status: responseData.ERROR,
            data: { message: err }
        });
    }
});

router.route('/:id/remove').post(async (req, res) => {
    try {
        if (req.params.id) {
            const deletedTherapist = await deleteTherapistHandler(req.params.id);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    hasTherapistDeleted: true
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

