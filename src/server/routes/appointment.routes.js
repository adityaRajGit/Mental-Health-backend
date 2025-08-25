
import _ from 'lodash';
import {Router} from 'express';

import {
    addNewAppointmentHandler,
    addNewAppointmentHandlerV2,
    deleteAppointmentHandler,
    getAppointmentDetailsHandler,
    getAppointmentListHandler,
    updateAppointmentDetailsHandler,
    getAllUpcomingAppointmentsHandler,
    getAllPastAppointmentsHandler,
    getUpcomingAppointmentsByUserHandler,
    getPastAppointmentsByUserHandler,
} from '../../common/lib/appointment/appointmentHandler';
import responseStatus from "../../common/constants/responseStatus.json";
import responseData from "../../common/constants/responseData.json";

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
  
      const outputResult = await getAppointmentListHandler(filter);
      res.status(responseStatus.STATUS_SUCCESS_OK);
      res.send({
        status: responseData.SUCCESS,
        data: {
          appointmentList: outputResult.list ? outputResult.list : [],
          appointmentCount: outputResult.count ? outputResult.count : 0,
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

  
router.get('/upcoming', async (req, res) => {
    try {
        const appointments = await getAllUpcomingAppointmentsHandler();
        res.status(responseStatus.STATUS_SUCCESS_OK).send({
            status: responseData.SUCCESS,
            data: { appointments }
        });
    } catch (err) {
        res.status(responseStatus.INTERNAL_SERVER_ERROR).send({
            status: responseData.ERROR,
            data: { message: err }
        });
    }
});

router.get('/past', async (req, res) => {
    try {
        const appointments = await getAllPastAppointmentsHandler()
        res.status(responseStatus.STATUS_SUCCESS_OK).send({
            status: responseData.SUCCESS,
            data: { appointments }
        });
    } catch (err) {
        res.status(responseStatus.INTERNAL_SERVER_ERROR).send({
            status: responseData.ERROR,
            data: { message: err }
        });
    }
});

router.get('/upcoming/:id', async (req, res) => {
    try {
        const appointments = await getUpcomingAppointmentsByUserHandler(req.params.id);
        res.status(responseStatus.STATUS_SUCCESS_OK).send({
            status: responseData.SUCCESS,
            data: { appointments }
        });
    } catch (err) {
        res.status(responseStatus.INTERNAL_SERVER_ERROR).send({
            status: responseData.ERROR,
            data: { message: err }
        });
    }
});

router.get('/past/:id', async (req, res) => {
    try {
        const appointments = await getPastAppointmentsByUserHandler(req.params.id)
        res.status(responseStatus.STATUS_SUCCESS_OK).send({
            status: responseData.SUCCESS,
            data: { appointments }
        });
    } catch (err) {
        res.status(responseStatus.INTERNAL_SERVER_ERROR).send({
            status: responseData.ERROR,
            data: { message: err }
        });
    }
});

router.route('/new').post(async (req, res) => {
    try {
       if (!_.isEmpty(req.body)) {
            const outputResult = await addNewAppointmentHandlerV2(req.body);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    appointment: outputResult ? outputResult : {}
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
            const gotAppointment = await getAppointmentDetailsHandler(req.params);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    appointment: gotAppointment ? gotAppointment : {}
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
        if (!_.isEmpty(req.params.id) && !_.isEmpty(req.body) && !_.isEmpty(req.body.appointment)) {
            let input = {
                objectId: req.params.id,
                updateObject: req.body.appointment
            }
            const updateObjectResult = await updateAppointmentDetailsHandler(input);
            res.status(responseStatus.STATUS_SUCCESS_OK);
                res.send({
                    status: responseData.SUCCESS,
                    data: {
                        appointment: updateObjectResult ? updateObjectResult : {}
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
            const deletedAppointment = await deleteAppointmentHandler(req.params.id);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    hasAppointmentDeleted: true
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
  
