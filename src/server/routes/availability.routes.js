
import _ from 'lodash';
import {Router} from 'express';

import {
    addNewAvailabilityHandler,
    deleteAvailabilityHandler,
    getAvailabilityDetailsByTherapistHandler,
    getAvailabilityDetailsHandler,
    getAvailabilityListHandler,
    updateAvailabilityDetailsHandler
} from '../../common/lib/availability/availabilityHandler';
import {getAllTherapistTimelinesAndSpecialization
} from '../../common/lib/therapist/therapistHandler';
import { getAvailableTimeSlotsForDate } from '../../common/lib/appointment/appointmentHandler';
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
  
      const outputResult = await getAvailabilityListHandler(filter);
      res.status(responseStatus.STATUS_SUCCESS_OK);
      res.send({
        status: responseData.SUCCESS,
        data: {
          availabilityList: outputResult.list ? outputResult.list : [],
          availabilityCount: outputResult.count ? outputResult.count : 0,
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
            const outputResult = await addNewAvailabilityHandler(req.body);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    availability: outputResult ? outputResult : {}
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
            const gotAvailability = await getAvailabilityDetailsHandler(req.params);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    availability: gotAvailability ? gotAvailability : {}
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

router.route('/get-by-therapist/:id').get(async (req, res) => {
    try {
        if (req.params.id) {
            const gotAvailability = await getAvailabilityDetailsByTherapistHandler(req.params);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    availability: gotAvailability ? gotAvailability : {}
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
        if (!_.isEmpty(req.params.id) && !_.isEmpty(req.body)) {
            let input = {
                objectId: req.params.id,
                updateObject: req.body
            }
            const updateObjectResult = await updateAvailabilityDetailsHandler(input);
            res.status(responseStatus.STATUS_SUCCESS_OK);
                res.send({
                    status: responseData.SUCCESS,
                    data: {
                        availability: updateObjectResult ? updateObjectResult : {}
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
            const deletedAvailability = await deleteAvailabilityHandler(req.params.id);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    hasAvailabilityDeleted: true
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

router.route('/availabilityTimeSlots').post(async (req, res) => {
    try {
        // Validate request body contains a date
        if (!req.body || !req.body.date) {
            return res.status(responseStatus.BAD_REQUEST).send({
                status: responseData.ERROR,
                data: { message: "Date is required in format YYYY-MM-DD" }
            });
        }

        const { date } = req.body;
        
        // Validate date format (basic validation)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(responseStatus.BAD_REQUEST).send({
                status: responseData.ERROR,
                data: { message: "Invalid date format. Please use YYYY-MM-DD" }
            });
        }

        // Get available time slots for the specified date
        const availableSlots = await getAvailableTimeSlotsForDate(date);
        
        // Return success response with available slots
        res.status(responseStatus.STATUS_SUCCESS_OK).send({
            status: responseData.SUCCESS,
            data: availableSlots
        });
    }
    catch(e) {
        console.error("Error getting available time slots:", e);
        res.status(responseStatus.INTERNAL_SERVER_ERROR).send({
            status: responseData.ERROR,
            data: { message: e.message || e }
        });
    }
})

export default router;
  
