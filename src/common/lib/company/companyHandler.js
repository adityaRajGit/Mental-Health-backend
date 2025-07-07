import companyHelper from '../../helpers/company.helper';

export async function addNewCompanyHandler(input) {
    return await companyHelper.addObject(input);
}

export async function getCompanyDetailsHandler(input) {
    return await companyHelper.getObjectById(input);
}

export async function updateCompanyDetailsHandler(input) {
    return await companyHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getCompanyListHandler(input) {
    const list = await companyHelper.getAllObjects(input);
    const count = await companyHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteCompanyHandler(input) {
    return await companyHelper.deleteObjectById(input);
}

export async function getCompanyByQueryHandler(input) {
    return await companyHelper.getObjectByQuery(input);
}  
