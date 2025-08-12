import availabilityHelper from '../../helpers/availability.helper';

export async function addNewAvailabilityHandler(input) {
    return await availabilityHelper.addObject(input);
}

export async function getAvailabilityDetailsHandler(input) {
    return await availabilityHelper.getObjectById(input);
}

export async function updateAvailabilityDetailsHandler(input) {
    return await availabilityHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getAvailabilityListHandler(input) {
    const list = await availabilityHelper.getAllObjects(input);
    const count = await availabilityHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteAvailabilityHandler(input) {
    return await availabilityHelper.deleteObjectById(input);
}

export async function getAvailabilityByQueryHandler(input) {
    return await availabilityHelper.getObjectByQuery(input);
}  
