import shareHelper from '../../helpers/share.helper';

export async function addNewShareHandler(input) {
    return await shareHelper.addObject(input);
}

export async function getShareDetailsHandler(input) {
    return await shareHelper.getObjectById(input);
}

export async function updateShareDetailsHandler(input) {
    return await shareHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getShareListHandler(input) {
    const list = await shareHelper.getAllObjects(input);
    const count = await shareHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteShareHandler(input) {
    return await shareHelper.deleteObjectById(input);
}

export async function getShareByQueryHandler(input) {
    return await shareHelper.getObjectByQuery(input);
}  
