import userHelper from '../../helpers/user.helper.js';
import appointmentHelper from '../../helpers/appointment.helper';
import therapistHelper from '../../helpers/therapist.helper';
import { v2 as cloudinary } from "cloudinary";
import company from '../../models/company.js';
import companyHelper from '../../helpers/company.helper.js';
import {verifyEmailOTP,sendVerificationEmail} from '../../util/utilHelper.js';
import packageHelper from '../../helpers/package.helper.js';


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
    if (!companyDomain) {
        throw "Invalid email format"
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
        throw "No company found with this email domain"
    }
    
    // Send OTP to email
    const otpResult = await sendVerificationEmail(input.body.email, "Email Verification Otp");
    
    if (!otpResult.success) {
        throw "Failed to send verification email"
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
        // console.log("Verifying OTP for email:", email, "OTP:", otp);
        
        // Verify OTP
        const verificationResult = await verifyEmailOTP(email, otp);
        // console.log("Verification result:", verificationResult);
        
        if (!verificationResult.success) {
            const errorMessage = verificationResult.error || verificationResult.message || "Invalid or expired OTP";
            throw new Error(errorMessage);
        }
        
        // Check if user already exists
        const existingUser = await userHelper.getObjectByQuery({
            query: { email: email }
        });
        
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        
        // Hash password if provided
        if (userData.password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }
        
        // Generate username if not provided
        if (!userData.username && userData.name) {
            userData.username = generateUsername(userData.name);
        }
        // Find company based on email domain
        const companyDomain = email.split("@")[1];
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

        // Add company_id to userData
        userData.company_id = companiesWithDomain[0]._id;
        userData.email = email;
        userData.role = userData.role || "user";
        userData.email_verified = true;
        // Create user in database
        const newUser = await userHelper.addObject(userData);
        
        return {
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role
            }
        };
        
    } catch (error) {
        console.error("Error in verifyOtpAndCreateUserHandler:", error);
        throw new Error(`OTP verification failed: ${error.message}`);
    }
}

export async function userCompanyCreditCheck(input) {
    try {
        // Validate input
        if (!input) {
            throw new Error("User ID is required");
        }
        // Get user ID - can be either a string or an object with id property
        const userId = typeof input === 'string' ? input : input.id;
        // console.log("Input:", input);
        
        // Get user and ensure it exists
        const user = await userHelper.getObjectById({ id: userId });
        if (!user) {
            throw new Error("User not found");
        }
        
        // Ensure user has a company_id
        if (!user.company_id) {
            throw new Error("User is not associated with any company");
        }
        
        // Get company and ensure it exists
        const companyId = user.company_id.toString();
        const userCompany = await companyHelper.getObjectById({ id: companyId });
        if (!userCompany) {
            throw new Error("Company not found");
        }

        // Ensure company has a package
        if (!userCompany.package) {
            throw new Error("Company does not have an assigned package");
        }

        const packageId = userCompany.package.toString();
        const companyPackage = await packageHelper.getObjectById({ id: packageId });
        if (!companyPackage) {
            throw new Error("Package not found");
        }

        // Determine if company package is exhausted
        const is_completed = userCompany.status === 'completed';
        
        return {
            counselling_sessions: userCompany.counselling_sessions,
            package_sessions: companyPackage.total_counselling_sessions,
            company_package_exhausted: is_completed
        };
    } catch (error) {
        console.error("Error checking company credits:", error);
        throw error;
    }
}

// Helper function to generate username
function generateUsername(name) {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${cleanName}${randomNumber}`;
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