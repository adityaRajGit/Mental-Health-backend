import userHelper from '../../helpers/user.helper';

function generateUsername(name) {
    if (!name) return `user${Date.now()}`;
    const base = name.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '_');
    return `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function addNewUserHandler(input) {
    // Auto-generate username if not provided
    if (!input.username && input.name) {
        input.username = generateUsername(input.name);
    }
    return await userHelper.addObject(input);
}

export async function getUserDetailsHandler(input) {
    return await userHelper.getObjectById(input);
}

export const getUserDetailsHandler = async (input) => {
    try {
        const userId = typeof input === 'string' ? input : input.id;
        
        if (!userId || typeof userId !== 'string') {
            throw new Error('Invalid user ID');
        }
        
        const gotUser = await userHelper.getObjectById(userId);
        return gotUser;
    } catch (err) {
        throw err;
    }
};

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