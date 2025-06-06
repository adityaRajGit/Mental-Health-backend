import therapistHelper from '../../helpers/therapist.helper';
import { v2 as cloudinary } from "cloudinary";

export async function addNewTherapistHandlerV2(input) {
  
  // Add file paths to therapist data
  if (input.files && input.files.img) {
    input.images = input.files.img.map(file => ({ path: file.path }));
  }

  let imageUrls = [];

  // Upload images to Cloudinary
  if (input.images && input.images.length > 0) {
    for (const image of input.images) {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "therapist",
      });
      imageUrls.push(result.secure_url);
    }
  }

  if (imageUrls.length > 0) {
    input.profile_image = imageUrls[0];
  }
  

  return await therapistHelper.addObject(input);
}

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
