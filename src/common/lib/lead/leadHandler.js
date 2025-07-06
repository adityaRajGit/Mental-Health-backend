import leadHelper from '../../helpers/lead.helper';

export async function addNewLeadHandler(input) {
    return await leadHelper.addObject(input);
}

export async function getLeadDetailsHandler(input) {
    return await leadHelper.getObjectById(input);
}

export async function updateLeadDetailsHandler(input) {
    return await leadHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getLeadListHandler(input) {
    const list = await leadHelper.getAllObjects(input);
    const count = await leadHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteLeadHandler(input) {
    return await leadHelper.deleteObjectById(input);
}

export async function getLeadByQueryHandler(input) {
    return await leadHelper.getObjectByQuery(input);
}  
