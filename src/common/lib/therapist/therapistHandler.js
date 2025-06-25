import therapistHelper from '../../helpers/therapist.helper';
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import { generateToken } from '../../util/authUtil';
import { getUserInfo } from '../../util/utilHelper';
import userHelper from '../../helpers/user.helper';

export async function addNewTherapistHandlerV2(input) {

  // Add file paths to therapist data
  if (input.files && input.files.img) {
    input.images = input.files.img.map(file => ({ path: file.path }));
  }

  let imageUrls = [];

  // Upload images to Cloudinary
  if (input.images && input.images.length > 0) {
    for (const image of input.images) {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "therapist",
      });
      imageUrls.push(result.secure_url);
    }
  }

  if (imageUrls.length > 0) {
    input.profile_image = imageUrls[0];
  }


  return await therapistHelper.addObject(input);
}

export async function addNewTherapistHandler(input) {
  return await therapistHelper.addObject(input);
}

async function generateUniqueUsername(fullName) {
  const baseUsername = fullName.toLowerCase().replace(/\s+/g, '');
  let attempt = 0;
  let username;

  while (true) {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // Always 4 digits
    username = `${baseUsername}${randomNum}`;

    const exists = await therapistHelper.getObjectByQuery({ query: { username } });
    const exists2 = await userHelper.getObjectByQuery({ query: { username } });
    if (!exists) break;
    if (!exists2) break;

    attempt++;
    if (attempt > 10000) {
      throw "Too many attempts to generate a unique username"
    }
  }

  return username;
}


export async function therapistSignupHandler(input) {
  // Validate input fields
  if (!input.name || !input.phone || !input.email || !input.password) {
    throw "All fields (name, phone, email, password) are required"
  }

  // Hash the provided password
  const hashedPassword = await bcrypt.hash(input.password, 10);

  const existingUser = await therapistHelper.getObjectByQuery({
    query: { email: input.email },
  });

  if (existingUser) {
    throw "Therapist with this email already exists"
  }

  const existingUser2 = await therapistHelper.getObjectByQuery({
    query: { phone: input.phone },
  });

  if (existingUser2) {
    throw "Therapist with this phone number already exists"
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
  const newUser = await therapistHelper.addObject(userDetails);

  const userData = {
    name: newUser.name,
    phone: newUser.phone,
    email: newUser.email,
    role: newUser.role,
    username: newUser.username,
    _id: newUser._id,
  }

  // Generate a token for the new user
  const token = generateToken(userData, 'therapist');

  // Return the user info and token
  return { therapist: getUserInfo(newUser), token };
}

export async function therapistLoginHandler(input) {
  let user;

  if (input.email) {
    user = await therapistHelper.getObjectByQuery({
      query: { email: input.email },
    });
  } else if (input.phone) {
    user = await therapistHelper.getObjectByQuery({
      query: { phone: input.phone },
    });
  }

  if (!user) {
    throw "Therapist not found"
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) {
    throw "Invalid credentials"
  }

  const userData = {
    name: user.name,
    phone: user.phone,
    email: user.email,
    username: user.username,
    _id: user._id,
    role: user.role,
    profile_image: user.profile_image || "",
  }

  const token = generateToken(userData, "therapist");

  return { therapist: getUserInfo(user), token };
}

export async function getTherapistDetailsHandler(input) {
  return await therapistHelper.getObjectById(input);
}

export async function updateTherapistDetailsHandler(input) {
  return await therapistHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function updateTherapistDetailsHandlerV2(input) {
  
  if (input.files && input.files.img) {
    input.images = input.files.img.map(file => ({ path: file.path }));
  }

  let imageUrls = [];

  if (input.images && input.images.length > 0) {
    for (const image of input.images) {
      const result = await cloudinary.uploader.upload(image.path, {
        folder: "therapist",
      });
      imageUrls.push(result.secure_url);
    }
  }

  if (imageUrls.length > 0) {
    input.updateObject.profile_image = imageUrls[0];
  }

  return await therapistHelper.directUpdateObject(input.objectId, input.updateObject);
}

export function calculateTherapistProfileCompletion(therapist) {
  
  const fields = [
    'name',
    'email',
    'username',
    'phone',
    'profile_image',
    'academic_background.qualification',
    'academic_background.years_of_experience',
    'bio',
    'specialization',
    'session_details.duration',
    'session_details.cost',
    'session_details.currency',
    'languages',
    'location.city',
    'location.country'
  ];

  let filled = 0;

  fields.forEach(field => {
    const parts = field.split('.');
    let value = therapist;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined || value === null) break;
    }
    
    if (Array.isArray(value)) {
      if (value.length > 0) filled++;
    } else if (value !== undefined && value !== null && value !== '') {
      filled++;
    }
  });

  const percent = Math.round((filled / fields.length) * 100);
  return percent;
}

export async function getTherapistListHandler(input) {
  const list = await therapistHelper.getAllObjects(input);
  const count = await therapistHelper.getAllObjectCount(input);
  return { list, count };
}

export async function deleteTherapistHandler(input) {
  return await therapistHelper.deleteObjectById(input);
}

export async function getTherapistByQueryHandler(input) {
  return await therapistHelper.getObjectByQuery(input);
}  
