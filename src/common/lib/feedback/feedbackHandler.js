import feedbackHelper from '../../helpers/feedback.helper';

export async function addNewFeedbackHandler(input) {
    return await feedbackHelper.addObject(input);
}

export async function getFeedbackDetailsHandler(input) {
    return await feedbackHelper.getObjectById(input);
}

export async function updateFeedbackDetailsHandler(input) {
    return await feedbackHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getFeedbackListHandler(input) {
    const list = await feedbackHelper.getAllObjects(input);
    const count = await feedbackHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteFeedbackHandler(input) {
    return await feedbackHelper.deleteObjectById(input);
}

export async function getFeedbackByQueryHandler(input) {
    return await feedbackHelper.getObjectByQuery(input);
}  
