
import _ from 'lodash';
import {Router} from 'express';

import {
    addNewBlogHandler,
    deleteBlogHandler,
    getBlogDetailsHandler,
    getBlogListHandler,
    updateBlogDetailsHandler
} from '../../common/lib/blog/blogHandler';
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
  
      const outputResult = await getBlogListHandler(filter);
      res.status(responseStatus.STATUS_SUCCESS_OK);
      res.send({
        status: responseData.SUCCESS,
        data: {
          blogList: outputResult.list ? outputResult.list : [],
          blogCount: outputResult.count ? outputResult.count : 0,
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
            const outputResult = await addNewBlogHandler(req.body.blog);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    blog: outputResult ? outputResult : {}
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
            const gotBlog = await getBlogDetailsHandler(req.params);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    blog: gotBlog ? gotBlog : {}
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
        if (!_.isEmpty(req.params.id) && !_.isEmpty(req.body) && !_.isEmpty(req.body.blog)) {
            let input = {
                objectId: req.params.id,
                updateObject: req.body.blog
            }
            const updateObjectResult = await updateBlogDetailsHandler(input);
            res.status(responseStatus.STATUS_SUCCESS_OK);
                res.send({
                    status: responseData.SUCCESS,
                    data: {
                        blog: updateObjectResult ? updateObjectResult : {}
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
            const deletedBlog = await deleteBlogHandler(req.params.id);
            res.status(responseStatus.STATUS_SUCCESS_OK);
            res.send({
                status: responseData.SUCCESS,
                data: {
                    hasBlogDeleted: true
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
  
