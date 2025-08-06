import userHelper from '../../helpers/user.helper.js';
import appointmentHelper from '../../helpers/appointment.helper';
import therapistHelper from '../../helpers/therapist.helper';
import { v2 as cloudinary } from "cloudinary";
import company from '../../models/company.js';
import companyHelper from '../../helpers/company.helper.js';
import {verifyEmailOTP,sendVerificationEmail} from '../../util/utilHelper.js';
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

export async function userSignUpHandler(input) {
    const companyDomain = input.body.email.split("@")[1];
    console.log(companyDomain);
    if (!companyDomain) {
        throw new Error("Invalid email format");
    }
    
    // Search for companies with matching domain
    let companiesWithDomain = await companyHelper.getAllObjects({
        query: { 
            company_mail: { 
                $regex: new RegExp(`@${companyDomain}$`, "i")
            }
        }
    });

    // If no companies found, try matching just the domain part
    if (companiesWithDomain.length === 0) {
        const allCompanies = await companyHelper.getAllObjects({});
        companiesWithDomain = allCompanies.filter(company => 
            company.company_mail && company.company_mail.split("@")[1] === companyDomain
        );
    }
    
    if (companiesWithDomain.length === 0) {
        throw new Error("No company found with this email domain");
    }
    
    // Send OTP to email
    const otpResult = await sendVerificationEmail(input.body.email, "Email Verification for Company Registration");
    
    if (!otpResult.success) {
        throw new Error("Failed to send verification email");
    }

    return {
        message: "OTP sent successfully to your email. Please verify to complete registration.",
        email: input.body.email
    };
}

// Add new function to verify OTP and complete registration
export async function verifyOtpAndCreateUserHandler(input) {
    const { email, otp, userData } = input;
    
    if (!email || !otp) {
        throw new Error("Email and OTP are required");
    }
    
    try {
        // Verify OTP
        const verificationResult = await verifyEmailOTP(email, otp);
        
        if (!verificationResult.success) {
            throw new Error("Invalid or expired OTP");
        }
        
        // Check if user already exists
        const existingUser = await userHelper.getObjectByQuery({
            query: { email: email }
        });
        
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        
        // Generate username if not provided
        if (!userData.username && userData.name) {
            userData.username = generateUsername(userData.name);
        }
        
        // Add email to userData
        userData.email = email;
        
        // Create user in database
        const newUser = await userHelper.addObject(userData);
        
        return {
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username
            }
        };
        
    } catch (error) {
        throw new Error(`OTP verification failed: ${error.message}`);
    }
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