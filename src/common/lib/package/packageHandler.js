import configVariables from '../../../server/config';
import packageHelper from '../../helpers/package.helper';
import subscriptionHelper from '../../helpers/subscription.helper';
import userHelper from '../../helpers/user.helper';
import { processPayment } from '../../util/razorpay';
import crypto from 'crypto';

export async function addNewPackageHandler(input) {
    return await packageHelper.addObject(input);
}

export async function buyPackageHandler(input) {
    return await processPayment(input.amount);
}

export async function verifyPayment(input) {
    try {
        const {
            orderId,
            paymentId,
            signature,
            user_id,
            package_id
        } = input

        const secretKey = process.env.RAZORPAY_KEY_SECRET || configVariables.RAZORPAY_KEY_SECRET

        const hmac = crypto.createHmac("sha256", secretKey)

        hmac.update(orderId + "|" + paymentId)

        const generatedSignature = hmac.digest("hex")

        if (generatedSignature === signature) {

            const packageData = await packageHelper.getObjectById({ id: package_id });

             if (!packageData) {
                throw new Error('Package not Found');
            }

            const userData = await userHelper.getObjectById({ id: user_id });
            if (!userData) {
                throw new Error('User not Found');
            }

            // Get session count from package (handle both field names) + userData.sessions_balance
            const sessionCount = packageData.total_sessions;

            // Update user's session credits 
            await userHelper.directUpdateObject(user_id, {
                $inc: { sessions_balance: sessionCount }
            });

            // Create subscription record
            await subscriptionHelper.addObject(input);

            return { success: true, message: 'Order and Payment created successfully' }
        } else {
            console.log("Payment Verification Failed")
            throw "Payment Verification Failed"
        }
    } catch (error) {
        console.error("Error creating order and payment", error);
        throw error;
    }
}

export async function getPackageDetailsHandler(input) {
    return await packageHelper.getObjectById(input);
}

export async function updatePackageDetailsHandler(input) {
    return await packageHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getPackageListHandler(input) {
    const list = await packageHelper.getAllObjects(input);
    const count = await packageHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deletePackageHandler(input) {
    return await packageHelper.deleteObjectById(input);
}

export async function getPackageByQueryHandler(input) {
    return await packageHelper.getObjectByQuery(input);
}  
