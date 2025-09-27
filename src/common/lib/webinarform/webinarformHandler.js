import webinarformHelper from '../../helpers/webinarform.helper';

export async function addNewWebinarformHandler(input) {
    return await webinarformHelper.addObject(input);
}

export async function getWebinarformDetailsHandler(input) {
    return await webinarformHelper.getObjectById(input);
}

export async function updateWebinarformDetailsHandler(input) {
    return await webinarformHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getWebinarformListHandler(input) {
    const list = await webinarformHelper.getAllObjects(input);
    const count = await webinarformHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteWebinarformHandler(input) {
    return await webinarformHelper.deleteObjectById(input);
}

export async function getWebinarformByQueryHandler(input) {
    return await webinarformHelper.getObjectByQuery(input);
}  
