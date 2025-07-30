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
  try {
    let imageUrls = [];

    // Upload image(s) to Cloudinary
    if (input.files && input.files.img) {
      for (const file of input.files.img) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'therapist',
        });
        imageUrls.push(result.secure_url);
      }
    }

    // Set profile image if any were uploaded
    if (imageUrls.length > 0) {
      input.updateObject.profile_image = imageUrls[0];
    }

    // Inline parsing of stringified/nested form data
    const data = input.updateObject;

    // Parse fields only if they exist (defensive parsing)
    if (data.academic_background) {
      if (typeof data.academic_background === 'string') {
        data.academic_background = JSON.parse(data.academic_background);
      }

      if (data.academic_background.qualification && typeof data.academic_background.qualification === 'string') {
        data.academic_background.qualification = JSON.parse(data.academic_background.qualification);
      }

      if (data.academic_background.years_of_experience) {
        data.academic_background.years_of_experience = Number(data.academic_background.years_of_experience);
      }
    }

    if (data.specialization && typeof data.specialization === 'string') {
      data.specialization = JSON.parse(data.specialization);
    }

    if (data.experience && typeof data.experience === 'string') {
      data.experience = JSON.parse(data.experience);
    }

    if (data.services && typeof data.services === 'string') {
      data.services = JSON.parse(data.services);
    }

    if (data.languages && typeof data.languages === 'string') {
      data.languages = JSON.parse(data.languages);
    }

    if (data.session_details) {
      if (typeof data.session_details === 'string') {
        data.session_details = JSON.parse(data.session_details);
      }

      if (data.session_details.cost) {
        data.session_details.cost = Number(data.session_details.cost);
      }

      if (data.session_details.duration) {
        data.session_details.duration = Number(data.session_details.duration);
      }
    }

    if (data.location) {
      if (typeof data.location === 'string') {
        data.location = JSON.parse(data.location);
      }
    }

    // Final DB update
    return await therapistHelper.directUpdateObject(input.objectId, data);

  } catch (error) {
    console.error('Error in updateTherapistDetailsHandlerV2:', error);
    throw error;
  }
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

export async function recommendTherapistsHandler(input) {
  console.log("Starting recommendTherapistsHandler with input:", input);
  
  const {
    specialization,
    language,
    city,
    country,
    preferred_datetime
  } = input;

  console.log("Extracted parameters:", { specialization, language, city, country, preferred_datetime });

  if (!specialization || !preferred_datetime) {
    console.log("Validation failed: Missing required fields");
    throw "All fields [specialization and preferred_datetime] are required";
  }

  console.log("Required field validation passed");

  const datetime = new Date(preferred_datetime);
  if (isNaN(datetime.getTime())) {
    console.log("Date validation failed: Invalid preferred_datetime");
    throw "Invalid preferred_datetime";
  }

  console.log("Date validation passed. Parsed datetime:", datetime);

  const dayOfWeek = datetime.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
  console.log("Day of week determined:", dayOfWeek);

  // Find therapists matching specialization and available on the given day
  console.log("Querying therapists with criteria:", {
    availabilityField: `availability.${dayOfWeek}`,
    is_deleted: false
  });

  const therapists = await therapistHelper.getAllObjects({
    query: {
      specialization: specialization,
      [`availability.${dayOfWeek}`]: { $exists: true, $ne: [] },
      is_deleted: false
    }
  });

  console.log(`Found ${therapists.length} therapists matching base criteria`);

  const targetHour = datetime.getHours();
  const targetMinute = datetime.getMinutes();
  const targetTimeInMinutes = targetHour * 60 + targetMinute;
  console.log("Target time slot:", { 
    hour: targetHour, 
    minute: targetMinute, 
    timeString: `${targetHour.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')}`,
    totalMinutes: targetTimeInMinutes
  });

  // Helper function to convert "HH:MM" to minutes
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to check if target time falls within a time range
  const isTimeInRange = (targetMinutes, fromTime, toTime) => {
    const fromMinutes = timeToMinutes(fromTime);
    const toMinutes = timeToMinutes(toTime);
    return targetMinutes >= fromMinutes && targetMinutes <= toMinutes;
  };

  const scored = therapists.map(therapist => {
    console.log(`Scoring therapist: ${therapist._id || therapist.id}`);
    let score = 0;

    // Language match
    if (language && therapist.languages?.map(l => l.toLowerCase()).includes(language.toLowerCase())) {
      score += 2;
      console.log(`  Language match bonus (+2): ${language}`);
    } else if (language) {
      console.log(`  No language match for: ${language}`);
    }

    // City match
    if (city && therapist.location?.city?.toLowerCase() === city.toLowerCase()) {
      score += 0.5;
      console.log(`  City match bonus (+0.5): ${city}`);
    } else if (city) {
      console.log(`  No city match for: ${city}`);
    }

    // Country match
    if (country && therapist.location?.country?.toLowerCase() === country.toLowerCase()) {
      score += 1;
      console.log(`  Country match bonus (+1): ${country}`);
    } else if (country) {
      console.log(`  No country match for: ${country}`);
    }

    // Time range match - check if target time falls within any available time slot
    const availableTimeSlots = therapist.availability?.[dayOfWeek] || [];
    console.log(`  Available time slots for ${dayOfWeek}:`, availableTimeSlots);
    
    let timeMatch = false;
    let matchingSlot = null;
    
    for (const slot of availableTimeSlots) {
      if (slot.from && slot.to) {
        const isInRange = isTimeInRange(targetTimeInMinutes, slot.from, slot.to);
        console.log(`    Checking slot ${slot.from} - ${slot.to}: target ${targetHour.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')} is ${isInRange ? 'within' : 'outside'} range`);
        
        if (isInRange) {
          timeMatch = true;
          matchingSlot = slot;
          break;
        }
      } else {
        console.log(`    Skipping invalid slot:`, slot);
      }
    }
    
    if (timeMatch) {
      score += 2;
      console.log(`  Time match bonus (+2): Found matching slot ${matchingSlot.from} - ${matchingSlot.to}`);
    } else {
      console.log(`  No time match found for target time ${targetHour.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')}`);
    }

    console.log(`  Final score for therapist: ${score}`);
    return { therapist, score };
  }).filter(entry => {
    const include = entry.score > 0;
    console.log(`Filtering therapist with score ${entry.score}: ${include ? 'included' : 'excluded'}`);
    return include;
  });

  console.log(`${scored.length} therapists remaining after filtering (score > 0)`);

  scored.sort((a, b) => {
    const result = b.score - a.score;
    console.log(`Sorting: ${b.therapist._id || b.therapist.id} (${b.score}) vs ${a.therapist._id || a.therapist.id} (${a.score})`);
    return result;
  });

  console.log("Therapists sorted by score (highest first)");

  // Return the top recommended therapist (or empty if none)
  const result = {
    recommendedTherapist: scored.length > 0 ? getUserInfo(scored[0].therapist) : null
  };

  console.log("Final result:", {
    hasRecommendation: result.recommendedTherapist !== null,
    topScore: scored.length > 0 ? scored[0].score : 0,
    totalCandidates: scored.length
  });

  return result;
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
