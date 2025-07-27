import webinarHelper from '../../helpers/webinar.helper';

export async function addNewWebinarHandler(input) {
    return await webinarHelper.addObject(input);
}

export async function getWebinarDetailsHandler(input) {
    return await webinarHelper.getObjectById(input);
}

export async function updateWebinarDetailsHandler(input) {
    return await webinarHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getWebinarListHandler(input) {
    const list = await webinarHelper.getAllObjects(input);
    const count = await webinarHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteWebinarHandler(input) {
    return await webinarHelper.deleteObjectById(input);
}

export async function getWebinarByQueryHandler(input) {
    return await webinarHelper.getObjectByQuery(input);
}  
