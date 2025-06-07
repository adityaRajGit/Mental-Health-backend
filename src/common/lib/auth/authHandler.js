import userHelper from "../../helpers/user.helper";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { generateToken } from "../../util/authUtil";
import { getUserInfo } from "../../util/utilHelper";
import { USER } from "../../constants/enum";
import _ from "lodash";
import {
  generateOtpExpireDate,
  generateOtp,
  mailsender,
} from "../../util/utilHelper";

async function generateUniqueReferralCode() {
  let code;
  let user;
  do {
    // Generate an 8-character code (using UUID without dashes)
    code = uuidv4().replace(/-/g, "").slice(0, 8);
    // Check if the code already exists in the DB
    user = await userHelper.getObjectByQuery({ query: { referralCode: code } });
  } while (user);
  return code;
}

async function generateUniqueUsername(fullName) {
  const baseUsername = fullName.toLowerCase().replace(/\s+/g, '');
  let attempt = 0;
  let username;

  while (true) {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // Always 4 digits
    username = `${baseUsername}${randomNum}`;

    const exists = await userHelper.getObjectByQuery({ query: { username } });
    if (!exists) break;

    attempt++;
    if (attempt > 10000) {
      throw new Error("Too many attempts to generate a unique username");
    }
  }

  return username;
}


export async function userSignupHandler(input) {
  // Validate input fields
  if (!input.name || !input.phone || !input.email || !input.password) {
    throw new Error("All fields (name, phone, email, password) are required");
  }

  // Hash the provided password
  const hashedPassword = await bcrypt.hash(input.password, 10);

  const existingUser = await userHelper.getObjectByQuery({
    query: { email: input.email },
  });

  if (existingUser) {
    throw "User with this email already exists"
  }

  const existingUser2 = await userHelper.getObjectByQuery({
    query: { phone: input.phone },
  });

  if (existingUser2) {
    throw "User with this phone number already exists"
  }

  let username = await generateUniqueUsername(input.name);

  // Prepare user data
  const userDetails = {
    name: input.name,
    phone: input.phone,
    email: input.email,
    username: username,
    password: hashedPassword,
  };

  // Add the new user to the database
  const newUser = await userHelper.addObject(userDetails);

  const userData = {
    name: newUser.name,
    phone: newUser.phone,
    email: newUser.email,
    username: newUser.username,
    _id: newUser._id,
    profile_pic: newUser.profile_pic || ""
  }

  // Generate a token for the new user
  const token = generateToken(userData, USER);

  // Return the user info and token
  return { user: getUserInfo(newUser), token };
}

export async function userLoginHandler(input) {
  let user;

  if (input.email) {
    user = await userHelper.getObjectByQuery({
      query: { email: input.email },
    });
  } else if (input.phone) {
    user = await userHelper.getObjectByQuery({
      query: { phone: input.phone },
    });
  }

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const userData = {
    name: user.name,
    phone: user.phone,
    email: user.email,
    username: user.username,
    _id: user._id,
    profile_pic: user.profile_pic || ""
  }

  const token = generateToken(userData, "user");

  return { user: getUserInfo(user), token };
}

export async function updateUserDetailsHandler(input) {
  return await userHelper.directUpdateObject(
    input.objectId,
    input.updateObject
  );
}

export async function updateUserOtpHandler(userId, otp, expiry) {
  try {
    const updateData = {
      otp: otp,
      otp_expiry: expiry,
    };

    return await userHelper.directUpdateObject(userId, updateData);
  } catch (error) {
    console.error("Error in updateUserOtpHandler:", error);
    throw error;
  }
}

export async function changeUserPasswordHandler(objectId, email, newPassword) {
  try {
    // Fetch the user by objectId and email
    const user = await userHelper.getObjectByQuery({
      query: { _id: objectId, email: email },
      selectFrom: {}, // You can specify fields to select if needed
    });

    if (!user) {
      throw "User not found or email does not match";
    }

    // Update the user's password
    const updatedUser = await userHelper.directUpdateObject(objectId, {
      password: newPassword,
    });

    return updatedUser;
  } catch (error) {
    throw error;
  }
}

export async function verifyUserOtpHandler(email, otp) {
  try {
    const user = await userHelper.getObjectByQuery({
      query: { email },
      selectFrom: {
        name: 1,
        email: 1,
        role: 1,
        otp: 1,
        otp_expiry: 1,
      },
    });

    if (!user) {
      throw "User not found";
    }

    if (!user.otp) {
      throw "OTP not found, request a new one";
    }

    if (new Date() > new Date(user.otp_expiry)) {
      throw "OTP expired, request a new one";
    }

    if (user.otp.toString() !== otp.toString()) {
      throw "Invalid OTP";
    }
    const newOTP = generateOtp(6);
    const newExpiry = generateOtpExpireDate();

    // Clear OTP after successful verification
    await userHelper.directUpdateObject(user._id, {
      otp: newOTP,
      otp_expiry: newExpiry,
    });

    return user;
  } catch (error) {
    console.log("Error in verifyUserOtpHandler:", error);
    throw error;
  }
}

export async function getUserByEmailPasswordHandler(input) {
  try {
    console.log("Received input:", input);

    if (_.isEmpty(input.email) || _.isEmpty(input.password)) {
      throw "Email and password are required";
    }

    const filters = {
      query: { email: input.email },
      selectFrom: { name: 1, email: 1, role: 1, password: 1 }, // Include password for comparison
    };

    const user = await userHelper.getObjectByQuery(filters);

    if (!user) {
      throw "User not found!";
    }

    // Compare passwords using bcrypt
    const passwordMatch = await bcrypt.compare(input.password, user.password);

    if (!passwordMatch) {
      throw "Incorrect password!";
    }

    delete user.password;
    return user;
  } catch (error) {
    console.log("Error in getUserByEmailPasswordHandler:", error);
    throw error;
  }
}

export async function getUserByEmailHandler(input) {
  try {
    if (_.isEmpty(input.email)) {
      throw "Email is required";
    }

    const filters = {
      query: { email: input.email },
      selectFrom: { name: 1, email: 1, role: 1 },
    };

    const user = await userHelper.getObjectByQuery(filters);

    if (!user) {
      throw "User not found!";
    }

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export function handleValidationChangePassword(body) {
  const { oldPassword, newPassword } = body;

  if (!oldPassword || !newPassword) {
    return {
      isValid: false,
      message: "Both old password and new password are required",
    };
  }

  return { isValid: true, message: "Validation successful" };
}

export async function mail(body) {
  try {
    const { email, password } = body;
    if (!email || !password) {
      throw "Email and password are required";
    }
    const gotUser = await getUserByEmailPasswordHandler({ email, password });
    if (!gotUser) {
      throw "Invalid email or password";
    }

    const otp = generateOtp(6);
    const expiry = generateOtpExpireDate();

    await updateUserOtpHandler(gotUser._id, otp, expiry);

    await mailsender(gotUser.name, gotUser.email, otp);

    return gotUser;
  } catch (err) {
    console.log(err);
    res.status(responseStatus.INTERNAL_SERVER_ERROR);
    res.send({
      status: responseData.ERROR,
      data: { message: err },
    });
  }
}
