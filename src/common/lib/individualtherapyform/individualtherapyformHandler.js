import individualtherapyformHelper from '../../helpers/individualtherapyform.helper';

export async function addNewIndividualtherapyformHandler(input) {
    return await individualtherapyformHelper.addObject(input);
}

export async function getIndividualtherapyformDetailsHandler(input) {
    return await individualtherapyformHelper.getObjectById(input);
}

export async function updateIndividualtherapyformDetailsHandler(input) {
    return await individualtherapyformHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getIndividualtherapyformListHandler(input) {
    const list = await individualtherapyformHelper.getAllObjects(input);
    const count = await individualtherapyformHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteIndividualtherapyformHandler(input) {
    return await individualtherapyformHelper.deleteObjectById(input);
}

export async function getIndividualtherapyformByQueryHandler(input) {
    return await individualtherapyformHelper.getObjectByQuery(input);
}  
