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
        if (input.status === 'client') {
            await leadHelper.deleteObjectById(input.objectId);
            const data = {
                name: input.updateObject.company || input.updateObject.name,
                size: input.updateObject.employees,
                industry: input.updateObject.industry,
                company_mail: input.updateObject.email,
                status: 'in_process',
                website: input.updateObject.website,
                address: input.updateObject.address,
                package: input.updateObject.package, // ObjectId
                webinarsCompleted: 0,
                webinarsScheduled: 0,
                visibility: false,
                is_deleted: false,
                created_at: new Date(),
                updated_at: new Date()
            };
            const addCompany = await addNewCompanyHandler(data);
            return addCompany;
        } else {
            const updateObject = {
                status: input.status
            };
            return await leadHelper.directUpdateObject(input.objectId, updateObject);
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
