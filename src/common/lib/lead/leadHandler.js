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
        if (input.updateObject.stage === 'closed_won') {
            await leadHelper.deleteObjectById(input.objectId);
            const data = {
                name: input.updateObject.name,
                size: input.updateObject.size,
                industry: input.updateObject.industry,
                company_mail: input.updateObject.company_mail,
                website: input.updateObject.website,
                address: input.updateObject.address,
                package: input.updateObject.package,
            }
            const addCompany = await addNewCompanyHandler(data);
            return addCompany;
        } else {
            return await leadHelper.directUpdateObject(input.objectId, input.updateObject);
        }
    } catch (error) {
        console.log(error);
        throw error;
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
