import commentHelper from '../../helpers/comment.helper';

export async function addNewCommentHandler(input) {
    return await commentHelper.addObject(input);
}

export async function getCommentDetailsHandler(input) {
    return await commentHelper.getObjectById(input);
}

export async function updateCommentDetailsHandler(input) {
    return await commentHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getCommentListHandler(input) {
    const list = await commentHelper.getAllObjects(input);
    const count = await commentHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteCommentHandler(input) {
    return await commentHelper.deleteObjectById(input);
}

export async function getCommentByQueryHandler(input) {
    return await commentHelper.getObjectByQuery(input);
}  
