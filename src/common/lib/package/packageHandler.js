import packageHelper from '../../helpers/package.helper';

export async function addNewPackageHandler(input) {
    return await packageHelper.addObject(input);
}

export async function getPackageDetailsHandler(input) {
    return await packageHelper.getObjectById(input);
}

export async function updatePackageDetailsHandler(input) {
    return await packageHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getPackageListHandler(input) {
    const list = await packageHelper.getAllObjects(input);
    const count = await packageHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deletePackageHandler(input) {
    return await packageHelper.deleteObjectById(input);
}

export async function getPackageByQueryHandler(input) {
    return await packageHelper.getObjectByQuery(input);
}  
