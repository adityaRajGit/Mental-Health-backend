import userHelper from '../../helpers/user.helper';

export async function addNewUserHandler(input) {
    return await userHelper.addObject(input);
}

export async function getUserDetailsHandler(input) {
    return await userHelper.getObjectById(input);
}

export async function updateUserDetailsHandler(input) {
    return await userHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getUserListHandler(input) {
    const list = await userHelper.getAllObjects(input);
    const count = await userHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteUserHandler(input) {
    return await userHelper.deleteObjectById(input);
}

export async function getUserByQueryHandler(input) {
    return await userHelper.getObjectByQuery(input);
}  
