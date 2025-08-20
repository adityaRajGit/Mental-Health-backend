import therapistHelper from '../../helpers/therapist.helper';
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import { generateToken } from '../../util/authUtil';
import { getUserInfo } from '../../util/utilHelper';
import userHelper from '../../helpers/user.helper';
import therapist from '../../models/therapist';
import availabilityHelper from '../../helpers/availability.helper';
import appointmentHelper from '../../helpers/appointment.helper';
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



function validateRecommendationInput(input) {
  const { specialization, preferred_datetime } = input;
  
  if (!specialization || !preferred_datetime) {
    console.log("Validation failed: Missing required fields");
    throw "All fields [specialization and preferred_datetime] are required";
  }
  
  return true;
}


function parseDatetime(datetimeStr) {
  const datetime = new Date(datetimeStr);
  if (isNaN(datetime.getTime())) {
    console.log("Date validation failed: Invalid preferred_datetime");
    throw "Invalid preferred_datetime";
  }
  
  const dayOfWeek = datetime.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
  console.log("Day of week determined:", dayOfWeek);
  console.log("Time:", datetime.toLocaleString());
  return {
    datetime,
    dayOfWeek,
    targetMinutes: datetime.getHours() * 60 + datetime.getMinutes()
  };
}

// Fetch availabilities for a specific day
async function fetchAvailabilities(dayOfWeek,datetime) {
  const availabilities = await availabilityHelper.getAllObjects({
    query: {
      [`days.${dayOfWeek}`]: { $exists: true, $ne: [] },
      is_deleted: false
    }
  });
  console.log(`Found ${availabilities.length} availabilities for day: ${dayOfWeek}`);
  return availabilities;
}


async function getTherapistsWithConflictingAppointments(datetime, sessionDuration = 60) {
  const sessionStart = new Date(datetime);
  const sessionEnd = new Date(sessionStart.getTime() + sessionDuration * 60000);
  
  
  const conflictingAppointments = await appointmentHelper.getAllObjects({
    query: {
      payment_status: "CONFIRMED",
      is_deleted: false,
      $or: [
        // Appointment starts during our session
        {
          scheduled_at: {
            $gte: sessionStart,
            $lt: sessionEnd
          }
        },
        // Appointment ends during our session
        {
          $expr: {
            $and: [
              { $lte: ["$scheduled_at", sessionStart] },
              { $gt: [{ $add: ["$scheduled_at", { $multiply: ["$duration", 60000] }] }, sessionStart] }
            ]
          }
        }
      ]
    }
  });
  
  const busyTherapistIds = conflictingAppointments.map(apt => apt.therapist_id.toString());
  console.log(`Found ${busyTherapistIds.length} therapists with conflicting appointments:`, busyTherapistIds);
  
  return busyTherapistIds;
}

// Modify fetchMatchingTherapists to exclude busy therapists
async function fetchMatchingTherapists(therapistIds, criteria, busyTherapistIds = []) {
  const { specialization, language, city, country } = criteria;
  
  // Filter out busy therapists
  const availableTherapistIds = therapistIds.filter(id => 
    !busyTherapistIds.includes(id.toString())
  );
  
  console.log(`Available therapist IDs after filtering conflicts: ${availableTherapistIds.length}`);
  
  return await therapistHelper.getAllObjects({
    query: {
      _id: { $in: availableTherapistIds },
      ...(specialization ? { specialization: { $in: Array.isArray(specialization) ? specialization : [specialization] } } : {}),
      ...(language ? { languages: { $in: Array.isArray(language) ? language : [language] } } : {}),
      ...(city ? { "location.city": city } : {}),
      ...(country ? { "location.country": country } : {}),
      is_deleted: false
    }
  });
}


function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Check availability window
function isTimeInRange(targetMinutes, fromTime, toTime, sessionDuration = 60) {
  const fromMinutes = timeToMinutes(fromTime);
  const toMinutes = timeToMinutes(toTime);
  const sessionEndMinutes = targetMinutes + sessionDuration;
  
  return targetMinutes >= fromMinutes && sessionEndMinutes <= toMinutes;
}

 
function scoreTherapists(therapists, availabilities, criteria, targetMinutes) {
  const { language, city, country, dayOfWeek } = criteria;
  
  return therapists.map(therapist => {
    let score = 0;

    
    if (language) {
      const userLanguages = Array.isArray(language) ? language : [language];
      const therapistLanguages = therapist.languages?.map(l => l.toLowerCase()) || [];
      
      // Check for any matching languages
      const matchingLanguages = userLanguages.filter(l => 
        therapistLanguages.includes(l.toLowerCase())
      );
      
      if (matchingLanguages.length > 0) {
        score += 2;
        // Give slight bonus for each additional matching language
        if (matchingLanguages.length > 1) {
          score += 0.5 * (matchingLanguages.length - 1);
        }
      }
    }

    if (city && therapist.location?.city?.toLowerCase() === city.toLowerCase()) {
      score += 0.5;
    }

    
    if (country && therapist.location?.country?.toLowerCase() === country.toLowerCase()) {
      score += 1;
    }

    // Find matching time slot
    const therapistAvailability = availabilities.find(a => String(a.therapist) === String(therapist._id));
    const availableTimeSlots = therapistAvailability ? therapistAvailability.days[dayOfWeek] : [];

    let matchingSlot = null;
    for (const slot of availableTimeSlots) {
      if (slot.from && slot.to && isTimeInRange(targetMinutes, slot.from, slot.to)) {
        matchingSlot = slot;
        score += 4; // Time match is important
        break;
      }
    }

    return { therapist, score, matchingSlot };
  }).filter(entry => entry.score > 0);
}

// Format the recommended therapist data
function formatRecommendedTherapist(scoredTherapist) {
  if (!scoredTherapist) return null;
  
  const { therapist: t, score, matchingSlot } = scoredTherapist;
  
  return {
    id: t._id,
    name: t.name,
    email: t.email,
    specialization: t.specialization,
    languages: t.languages,
    location: t.location,
    profile_image: t.profile_image,
    session_details: t.session_details,
    score,
    available_slot: matchingSlot || null
  };
}


const userFailedAttempts = {};

function trackFailedAttempt(userId) {
    const now = Date.now();
    
    if (!userFailedAttempts[userId]) {
        userFailedAttempts[userId] = {
            count: 1,
            timestamp: now
        };
        return 1;
    }
    
    // Reset if last attempt was more than 30 minutes ago
    if (now - userFailedAttempts[userId].timestamp > 30 * 60 * 1000) {
        userFailedAttempts[userId] = {
            count: 1,
            timestamp: now
        };
        return 1;
    }
    
    // Otherwise increment the counter and update timestamp
    userFailedAttempts[userId].count += 1;
    userFailedAttempts[userId].timestamp = now;
    return userFailedAttempts[userId].count;
}

export async function recommendTherapistsHandler(input) {
  console.log("Starting recommendTherapistsHandler with input:", input);

  try {
    
    const userId = input.user_id;
    if (userId) {
      const attempts = userFailedAttempts[userId]?.count || 0;
      if (attempts >= 5) {
        console.log(`User ${userId} has had ${attempts} failed attempts.`);
        throw "Server Busy, Please Try Again";
      }
    }
    
    validateRecommendationInput(input);
    
    const { datetime, dayOfWeek, targetMinutes } = parseDatetime(input.preferred_datetime);
    
    // Get therapists with conflicting appointments
    const busyTherapistIds = await getTherapistsWithConflictingAppointments(datetime);
    
    const availabilities = await fetchAvailabilities(dayOfWeek, datetime);
    
    const therapistIds = availabilities.map(a => a.therapist);
    console.log(`Therapist IDs with availability:`, therapistIds);
    
    // Fetch matching therapists (excluding busy ones)
    const therapists = await fetchMatchingTherapists(therapistIds, {
      specialization: input.specialization,
      language: input.language,
      city: input.city,
      country: input.country
    }, busyTherapistIds);
    console.log(`Filtered therapists count after removing conflicts: ${therapists.length}`);
    
    const scored = scoreTherapists(therapists, availabilities, {
      language: input.language,
      city: input.city,
      country: input.country,
      dayOfWeek
    }, targetMinutes);
    
    scored.sort((a, b) => b.score - a.score);
    
    const recommendedTherapist = formatRecommendedTherapist(scored[0]);
    
    if (recommendedTherapist) {
      console.log("Recommended therapist:", recommendedTherapist);
      // Reset failed attempts counter if we found a therapist
      if (userId) {
        delete userFailedAttempts[userId]; // Reset counter on success
      }
    } else {
      console.log("No therapist matched the criteria with a positive score.");
      
      if (userId) {
        const attempts = trackFailedAttempt(userId);
        console.log(`User ${userId} has had ${attempts} failed attempts.`);
        
        // Check if user has too many failed attempts
        if (attempts >= 5) {
          throw "Server Busy, Please Try Again";
        }
      }
    }

    return { recommendedTherapist };
  }
  catch(e) {
    console.error("Error in recommendTherapistsHandler:", e);
    throw e;
  }
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

export async function getAllTherapistTimelinesAndSpecialization() {
  try {
    // Get all therapists with their availability data
    const therapists = await therapistHelper.getAllObjects({
      query: { is_deleted: false }
    });

    // Get all availabilities separately to ensure proper data access
    const allAvailabilities = await availabilityHelper.getAllObjects({
      query: { is_deleted: false }
    });

    console.log(`Found ${therapists.length} therapists and ${allAvailabilities.length} availability records`);

    // Extract all unique specializations
    const specializations = [...new Set(
      therapists.flatMap(therapist => therapist.specialization || [])
    )];

    // Map availabilities to therapists
    const therapistAvailabilities = therapists.map(therapist => {
      // Find this therapist's availability record
      const availabilityObj = allAvailabilities.find(a => 
        a.therapist && a.therapist.toString() === therapist._id.toString()
      );
      
      // Debug the availability structure
      if (availabilityObj) {
        console.log(`Found availability for therapist ${therapist.name}:`, 
          JSON.stringify(availabilityObj.days || availabilityObj));
      }
      
      // Try different possible structures for availability data
      let availabilityData;
      if (availabilityObj?.days) {
        availabilityData = availabilityObj.days;
      } else if (availabilityObj) {
        // Maybe days are directly in the object
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        if (daysOfWeek.some(day => Array.isArray(availabilityObj[day]))) {
          availabilityData = availabilityObj;
        }
      }
      
      return {
        name: therapist.name,
        availability: availabilityData || {
          sunday: [], monday: [], tuesday: [], wednesday: [],
          thursday: [], friday: [], saturday: []
        }
      };
    });

    // Merge all availabilities
    const mergedAvailability = mergeTherapistAvailability(therapistAvailabilities);

    return {
      specializations,
      availability: mergedAvailability
    };
  } catch (error) {
    console.error("Error getting therapist timelines and specializations:", error);
    throw error;
  }
}

// Main function to merge therapist availabilities
function mergeTherapistAvailability(therapists) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const mergedAvailability = {};

  // Debug output
  console.log(`Merging availability for ${therapists.length} therapists`);
  
  // Process each day
  for (const day of days) {
    // Collect all time slots for this day from all therapists
    const allSlots = therapists.flatMap(therapist => {
      const daySlots = therapist.availability[day] || [];
      console.log(`Therapist ${therapist.name} has ${daySlots.length} slots for ${day}`);
      return daySlots.map(slot => ({
        from: timeToMinutes(slot.from),
        to: timeToMinutes(slot.to)
      }));
    });

    console.log(`Total slots collected for ${day}: ${allSlots.length}`);

    if (allSlots.length === 0) {
      mergedAvailability[day] = [];
      continue;
    }

    // Sort slots by start time
    allSlots.sort((a, b) => a.from - b.from);

    // Merge overlapping slots
    const mergedSlots = [allSlots[0]];
    
    for (let i = 1; i < allSlots.length; i++) {
      const currentSlot = allSlots[i];
      const lastMergedSlot = mergedSlots[mergedSlots.length - 1];

      // Check if current slot overlaps or is adjacent to the last merged slot
      if (currentSlot.from <= lastMergedSlot.to || 
          currentSlot.from <= lastMergedSlot.to + 1) {
        // Merge by extending the end time if necessary
        lastMergedSlot.to = Math.max(lastMergedSlot.to, currentSlot.to);
      } else {
        // No overlap, add as a new slot
        mergedSlots.push(currentSlot);
      }
    }

    // Convert back to time strings
    mergedAvailability[day] = mergedSlots.map(slot => ({
      from: minutesToTime(slot.from),
      to: minutesToTime(slot.to)
    }));
    
    console.log(`Merged slots for ${day}: ${mergedAvailability[day].length}`);
  }

  return mergedAvailability;
}

// Helper function to convert minutes back to time string
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

