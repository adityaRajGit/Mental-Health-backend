import leadHelper from '../../helpers/lead.helper';
import { addNewCompanyHandler } from '../company/companyHandler';

export async function addNewLeadHandler(input) {
    return await leadHelper.addObject(input);
}

export async function getLeadDetailsHandler(input) {
    return await leadHelper.getObjectById(input);
}

export async function updateLeadDetailsHandler(input) {
    return await leadHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function updateLeadStatusHandler(input) {
    try {
        if (input.status === 'active') {
            await leadHelper.deleteObjectById(input.objectId);
            const data = {
                name: input.updateObject.name,
                company_mail: input.updateObject.company_mail,
                industry: input.updateObject.industry,
                address: input.updateObject.address,
                packageType: input.updateObject.package,
                size: input.updateObject.size,
                website: input.updateObject.website
            }
            const addCompany = await addNewCompanyHandler(data);
            return addCompany;
        } else {
            const updateObject = {
                status: 'inactive'
            }
            return await leadHelper.directUpdateObject(input.objectId, updateObject);
        }
    } catch (error) {
        console.log(error);
        throw error
    }

}

export async function getLeadListHandler(input) {
    const list = await leadHelper.getAllObjects(input);
    const count = await leadHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteLeadHandler(input) {
    return await leadHelper.deleteObjectById(input);
}

export async function getLeadByQueryHandler(input) {
    return await leadHelper.getObjectByQuery(input);
}  
