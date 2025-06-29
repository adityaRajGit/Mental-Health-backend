import userHelper from '../../helpers/user.helper.js';
import appointmentHelper from '../../helpers/appointment.helper';
import therapistHelper from '../../helpers/therapist.helper';
import { v2 as cloudinary } from "cloudinary";

function generateUsername(name) {
    if (!name) return `user${Date.now()}`;
    const base = name.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '_');
    return `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function addNewUserHandler(input) {

    if (!input.username && input.name) {
        input.username = generateUsername(input.name);
    }

    if (input.files && input.files.img) {
        input.images = input.files.img.map(file => ({ path: file.path }));
    }

    let imageUrls = [];

    if (input.images && input.images.length > 0) {
        for (const image of input.images) {
            const result = await cloudinary.uploader.upload(image.path, {
                folder: "user",
            });
            imageUrls.push(result.secure_url);
        }
    }

    if (imageUrls.length > 0) {
        input.profile_image = imageUrls[0];
    }

    return await userHelper.addObject(input);
}

export async function getUserDetailsHandler(input) {
    return await userHelper.getObjectById(input);
}


export const getUserDetailsHandlerV2 = async (input) => {
    try {
        const userId = typeof input === 'string' ? input : input.id;

        if (!userId || typeof userId !== 'string') {
            throw new Error('Invalid user ID');
        }

        const gotUser = await userHelper.getObjectById({ id: userId });
        return gotUser;
    } catch (err) {
        throw err;
    }
};


export async function getTherapistsForUser(userId) {
    const appointments = await appointmentHelper.getAllObjects({
        query: { user_id: userId, is_deleted: false }
    });
    const therapistIds = [
        ...new Set(appointments.map(app => app.therapist_id.toString()))
    ];
    if (therapistIds.length === 0) return [];
    const therapists = await therapistHelper.getAllObjects({
        query: { _id: { $in: therapistIds }, is_deleted: false }
    });
    return therapists;
}

export async function updateUserDetailsHandler(input) {
    if (input.files && input.files.img) {
        input.images = input.files.img.map(file => ({ path: file.path }));
    }

    let imageUrls = [];

    if (input.images && input.images.length > 0) {
        for (const image of input.images) {
            const result = await cloudinary.uploader.upload(image.path, {
                folder: "user",
            });
            imageUrls.push(result.secure_url);
        }
    }

    if (imageUrls.length > 0) {
        input.updateObject.profile_image = imageUrls[0];
    }
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