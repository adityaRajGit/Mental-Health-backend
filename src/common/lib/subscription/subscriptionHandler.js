import subscriptionHelper from '../../helpers/subscription.helper.js';
import packageHelper from '../../helpers/package.helper.js';
import userHelper from '../../helpers/user.helper.js';

export async function addNewSubscriptionHandler(input) {
    const { user_id, package_id } = input;
    
    const packageData = await packageHelper.getObjectById({ id: package_id });
    const userData = await userHelper.getObjectById({ id: user_id });
    console.log("Current Balance:"+userData.sessions_balance);
    
        
    if (!packageData) {
        throw new Error('Package not Found');
    }

    if (!userData) {
        throw new Error('User not Found');
    }

    // Get session count from package (handle both field names) + userData.sessions_balance
    const sessionCount = packageData.total_sessions ;
    
    console.log('Adding sessions to user:', sessionCount);

    // Update user's session credits 
    await userHelper.directUpdateObject(user_id, {
        $inc: { sessions_balance: sessionCount }
    });

    // Create subscription record
    return await subscriptionHelper.addObject(input);
}

export async function getSubscriptionDetailsHandler(input) {
    return await subscriptionHelper.getObjectById(input);
}

export async function updateSubscriptionDetailsHandler(input) {
    return await subscriptionHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getSubscriptionListHandler(input) {
    const list = await subscriptionHelper.getAllObjects(input);
    const count = await subscriptionHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteSubscriptionHandler(input) {
    return await subscriptionHelper.deleteObjectById(input);
}

export async function getSubscriptionByQueryHandler(input) {
    return await subscriptionHelper.getObjectByQuery(input);
}