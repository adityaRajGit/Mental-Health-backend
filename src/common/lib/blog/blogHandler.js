import blogHelper from '../../helpers/blog.helper';

export async function addNewBlogHandler(input) {
    return await blogHelper.addObject(input);
}

export async function getBlogDetailsHandler(input) {
    return await blogHelper.getObjectById(input);
}

export async function updateBlogDetailsHandler(input) {
    return await blogHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getBlogListHandler(input) {
    const list = await blogHelper.getAllObjects(input);
    const count = await blogHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteBlogHandler(input) {
    return await blogHelper.deleteObjectById(input);
}

export async function getBlogByQueryHandler(input) {
    return await blogHelper.getObjectByQuery(input);
}  
