import postHelper from '../../helpers/post.helper';

export async function addNewPostHandler(input) {
    return await postHelper.addObject(input);
}

export async function getPostDetailsHandler(input) {
    return await postHelper.getObjectById(input);
}

export async function updatePostDetailsHandler(input) {
    return await postHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getPostListHandler(input) {
    const list = await postHelper.getAllObjects(input);
    const count = await postHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deletePostHandler(input) {
    return await postHelper.deleteObjectById(input);
}

export async function getPostByQueryHandler(input) {
    return await postHelper.getObjectByQuery(input);
}  
