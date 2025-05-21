import therapistHelper from '../../helpers/therapist.helper';

export async function addNewTherapistHandler(input) {
    return await therapistHelper.addObject(input);
}

export async function getTherapistDetailsHandler(input) {
    return await therapistHelper.getObjectById(input);
}

export async function updateTherapistDetailsHandler(input) {
    return await therapistHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getTherapistListHandler(input) {
    const list = await therapistHelper.getAllObjects(input);
    const count = await therapistHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteTherapistHandler(input) {
    return await therapistHelper.deleteObjectById(input);
}

export async function getTherapistByQueryHandler(input) {
    return await therapistHelper.getObjectByQuery(input);
}  
