import adminHelper from '../../helpers/admin.helper';

export async function addNewAdminHandler(input) {
    return await adminHelper.addObject(input);
}

export async function getAdminDetailsHandler(input) {
    return await adminHelper.getObjectById(input);
}

export async function updateAdminDetailsHandler(input) {
    return await adminHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getAdminListHandler(input) {
    const list = await adminHelper.getAllObjects(input);
    const count = await adminHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteAdminHandler(input) {
    return await adminHelper.deleteObjectById(input);
}

export async function getAdminByQueryHandler(input) {
    return await adminHelper.getObjectByQuery(input);
}  
