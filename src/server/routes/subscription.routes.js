
import _ from 'lodash';
import {Router} from 'express';

import {
    addNewSubscriptionHandler,
    deleteSubscriptionHandler,
    getSubscriptionDetailsHandler,
    getSubscriptionListHandler,
    updateSubscriptionDetailsHandler
} from '../../common/lib/subscription/subscriptionHandler';
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
  
      const outputResult = await getSubscriptionListHandler(filter);
      res.status(responseStatus.STATUS_SUCCESS_OK);
      res.send({
        status: responseData.SUCCESS,
        data: {
          subscriptionList: outputResult.list ? outputResult.list : [],
          subscriptionCount: outputResult.count ? outputResult.count : 0,
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
            const outputResult = await addNewSubscriptionHandler(req.body.subscription);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    subscription: outputResult ? outputResult : {}
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
            const gotSubscription = await getSubscriptionDetailsHandler(req.params);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    subscription: gotSubscription ? gotSubscription : {}
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
        if (!_.isEmpty(req.params.id) && !_.isEmpty(req.body) && !_.isEmpty(req.body.subscription)) {
            let input = {
                objectId: req.params.id,
                updateObject: req.body.subscription
            }
            const updateObjectResult = await updateSubscriptionDetailsHandler(input);
            res.status(responseStatus.STATUS_SUCCESS_OK);
                res.send({
                    status: responseData.SUCCESS,
                    data: {
                        subscription: updateObjectResult ? updateObjectResult : {}
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
            const deletedSubscription = await deleteSubscriptionHandler(req.params.id);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    hasSubscriptionDeleted: true
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
  
