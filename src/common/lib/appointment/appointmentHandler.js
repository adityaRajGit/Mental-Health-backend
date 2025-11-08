import therapistHelper from '../../helpers/therapist.helper';
import userHelper from '../../helpers/user.helper.js';
import availabilityHelper from '../../helpers/availability.helper';
import appointmentHelper from '../../helpers/appointment.helper';
import { sendAppointmentEmail } from '../../util/utilHelper.js';
import moment from 'moment-timezone';
import { createGoogleMeetEvent } from '../../../util/googleMeet.js';

export async function addNewAppointmentHandler(input) {
    return await appointmentHelper.addObject(input);
}

export async function getAllUpcomingAppointmentsHandler() {
    try {
        const now = new Date();

        const allAppointments = await appointmentHelper.getAllObjects({
            query: {
                is_deleted: false
            }
        });

        if (allAppointments.length === 0) return [];

        const upcomingAppointments = allAppointments.filter(appointment => {
            const scheduledDate = new Date(appointment.scheduled_at);
            return scheduledDate >= now;
        });

        return upcomingAppointments.sort((a, b) => {
            return new Date(a.scheduled_at) - new Date(b.scheduled_at);
        });
    } catch (error) {
        throw error;
    }
}

export async function getAllPastAppointmentsHandler() {
    try {
        const now = new Date();

        const allAppointments = await appointmentHelper.getAllObjects({
            query: {
                is_deleted: false
            }
        });

        if (allAppointments.length === 0) return [];

        const pastAppointments = allAppointments.filter(appointment => {
            const scheduledDate = new Date(appointment.scheduled_at);
            return scheduledDate < now;
        });

        return pastAppointments.sort((a, b) => {
            return new Date(b.scheduled_at) - new Date(a.scheduled_at);
        });
    } catch (error) {
        throw error;
    }
}

export async function getUpcomingAppointmentsByUserHandler(userIdOrTherapistId) {
    try {
        const now = new Date();

        // First try fetching by user_id
        let userAppointments = await appointmentHelper.getAllObjects({
            query: {
                user_id: userIdOrTherapistId,
                is_deleted: false
            },
            populatedQuery: [
                {
                    model: 'Therapist',
                    path: 'therapist_id',
                    select: ''
                }
            ]
        });

        // If no appointments found by user_id, try therapist_id
        if (userAppointments.length === 0) {
            userAppointments = await appointmentHelper.getAllObjects({
                query: {
                    therapist_id: userIdOrTherapistId,
                    is_deleted: false
                },
                populatedQuery: [
                    {
                        model: 'User',
                        path: 'user_id',
                        select: ''
                    }
                ]
            });
        }

        if (userAppointments.length === 0) return [];

        const upcomingAppointments = userAppointments.filter(appointment => {
            const scheduledDate = new Date(appointment.scheduled_at);
            const oneHourAfter = new Date(scheduledDate.getTime() + 60 * 60 * 1000);

            // keep if appointment is in the future OR within 1 hour after start
            return scheduledDate >= now || (now >= scheduledDate && now <= oneHourAfter);
        });

        return upcomingAppointments.sort((a, b) => {
            return new Date(a.scheduled_at) - new Date(b.scheduled_at);
        });
    } catch (error) {
        throw error;
    }
}

export async function getPastAppointmentsByUserHandler(userIdOrTherapistId) {
    try {
        const now = new Date();

        // First try fetching by user_id
        let userAppointments = await appointmentHelper.getAllObjects({
            query: {
                user_id: userIdOrTherapistId,
                is_deleted: false
            },
            populatedQuery: [
                {
                    model: 'Therapist',
                    path: 'therapist_id',
                    select: '_id name profile_image session_details'
                }
            ]
        });

        // If no appointments found by user_id, try therapist_id
        if (userAppointments.length === 0) {
            userAppointments = await appointmentHelper.getAllObjects({
                query: {
                    therapist_id: userIdOrTherapistId,
                    is_deleted: false
                },
                populatedQuery: [
                    {
                        model: 'User',
                        path: 'user_id',
                        select: ''
                    }
                ]
            });
        }

        if (userAppointments.length === 0) return [];

        const pastAppointments = userAppointments.filter(appointment => {
            const scheduledDate = new Date(appointment.scheduled_at);
            return scheduledDate < now;
        });

        return pastAppointments.sort((a, b) => {
            return new Date(b.scheduled_at) - new Date(a.scheduled_at);
        });
    } catch (error) {
        throw error;
    }
}



export async function addNewAppointmentHandlerV2(input) {
    // Parse the scheduled_at date - handle both formats
    let scheduledAt;
    if (input.scheduled_at) {
        scheduledAt = new Date(input.scheduled_at);
    } else if (input.appointment?.scheduled_at) {
        scheduledAt = new Date(input.appointment.scheduled_at);
    } else {
        throw new Error("scheduled_at is required");
    }
    
    if (isNaN(scheduledAt.getTime())) {
        throw new Error("Invalid scheduled_at date format");
    }
    
    // Extract user_id and therapist_id from either flat or nested structure
    const user_id = input.user_id || input.appointment?.user_id;
    const therapist_id = input.therapist_id || input.appointment?.therapist_id;
    
    if (!user_id || !therapist_id) {
        throw new Error("user_id and therapist_id are required");
    }
    
    // Fetch user details (including name for email)
    const users = await userHelper.getAllObjects({
        query: { is_deleted: false, _id: user_id },
        select: 'email name'
    });
    
    // Fetch therapist details (including session duration)
    const therapists = await therapistHelper.getAllObjects({
        query: { is_deleted: false, _id: therapist_id },
        select: 'name session_details'
    });
    
    // Check if user and therapist exist
    if (users.length === 0) {
        throw new Error("User not found");
    }
    if (therapists.length === 0) {
        throw new Error("Therapist not found");
    }
    
    // Get duration from therapist's session details (default to 60 if not found)
    const duration = therapists[0].session_details?.duration || 60;
    
    let meetLink = null;
    try {
        meetLink = await createGoogleMeetEvent({
            summary: "Therapy Session",
            description: "Your scheduled therapy appointment",
            startTime: scheduledAt.toISOString(),
            endTime: new Date(scheduledAt.getTime() + duration * 60000).toISOString(),
            attendees: input.attendees || [] 
        });
    } catch (meetError) {
        console.warn("Failed to create Google Meet link:", meetError.message);
        // Continue without meet link
    }
    
    // Create appointment object
    const appointmentData = {
        user_id: user_id,
        therapist_id: therapist_id,
        scheduled_at: scheduledAt,
        duration: duration,
        ...(meetLink && { meet_link: meetLink })
    };
    
    const savedAppointment = await appointmentHelper.addObject(appointmentData);
    
    try {
        await sendAppointmentEmail(
            users[0].email,
            users[0].name || 'Valued User',
            therapists[0].name,
            therapists[0].email,
            scheduledAt.toLocaleString(),
            meetLink
        );
        console.log("Appointment email sent successfully");
    } catch (emailError) {
        console.error("Failed to send appointment email:", emailError);
        // Don't throw error here - appointment is already created
    }
    
    return savedAppointment;
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

        // console.log(`Found ${therapists.length} therapists and ${allAvailabilities.length} availability records`);

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
            // if (availabilityObj) {
            //   console.log(`Found availability for therapist ${therapist.name}:`, 
            //     JSON.stringify(availabilityObj.days || availabilityObj));
            // }

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
    // console.log(`Merging availability for ${therapists.length} therapists`);

    // Process each day
    for (const day of days) {
        // Collect all time slots for this day from all therapists
        const allSlots = therapists.flatMap(therapist => {
            const daySlots = therapist.availability[day] || [];
            // console.log(`Therapist ${therapist.name} has ${daySlots.length} slots for ${day}`);
            return daySlots.map(slot => ({
                from: timeToMinutes(slot.from),
                to: timeToMinutes(slot.to)
            }));
        });

        // console.log(`Total slots collected for ${day}: ${allSlots.length}`);

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

        // console.log(`Merged slots for ${day}: ${mergedAvailability[day].length}`);
    }

    return mergedAvailability;
}

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Helper function to convert minutes to time string
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}


export async function getAvailableTimeSlotsForDate(date) {
    // console.log(`========== STARTING getAvailableTimeSlotsForDate for date: ${date} ==========`);
    try {
        // Parse the date to get day of week
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            // console.error(`Invalid date format: ${date}`);
            throw new Error("Invalid date format. Please use YYYY-MM-DD format.");
        }

        // Get day of week (lowercase)
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = daysOfWeek[dateObj.getDay()];
        // console.log(`Date ${date} is a ${dayOfWeek}`);

        // Get general availability and specializations
        // console.log(`Fetching general availability from getAllTherapistTimelinesAndSpecialization...`);
        const { specializations, availability } = await getAllTherapistTimelinesAndSpecialization();
        // console.log(`Got ${specializations.length} specializations and availability for ${Object.keys(availability).filter(day => availability[day].length > 0).join(', ')}`);

        // Get day's slots
        const daySlots = availability[dayOfWeek] || [];
        // console.log(`Available slots for ${dayOfWeek}: ${JSON.stringify(daySlots)}`);

        if (daySlots.length === 0) {
            // console.log(`No availability found for ${dayOfWeek}`);
            // No availability for this day
            return {
                specializations,
                date,
                dayOfWeek,
                availability: []
            };
        }

        // Create start and end of the date for appointment filtering
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // console.log(`Querying appointments between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);

        // Fetch appointments for this specific date
        const appointmentsQuery = {
            query: {
                $or: [
                    // For appointments with payment_status
                    {
                        scheduled_at: {
                            $gte: startOfDay,
                            $lte: endOfDay
                        },
                        is_deleted: false,
                        payment_status: 'CONFIRMED'
                    },
                    // For appointments with appointment_status
                    {
                        scheduled_at: {
                            $gte: startOfDay,
                            $lte: endOfDay
                        },
                        is_deleted: false,
                        appointment_status: 'scheduled'
                    }
                ]
            }
        };
        // console.log(`Appointment query: ${JSON.stringify(appointmentsQuery.query)}`);

        const appointments = await appointmentHelper.getAllObjects(appointmentsQuery);
        // console.log(`Found ${appointments.length} appointments for ${date}`);

        if (appointments.length > 0) {
            appointments.forEach(app => {
                // console.log(`Appointment: therapist_id=${app.therapist_id}, scheduled_at=${new Date(app.scheduled_at).toLocaleString()}, duration=${app.duration || 60}min`);
            });
        }

        // Convert appointments to time ranges (in minutes)
        const bookedSlots = appointments.map(appointment => {
            const startTime = new Date(appointment.scheduled_at);
            const endTime = new Date(startTime.getTime() + (appointment.duration || 60) * 60000);

            const fromMinutes = startTime.getHours() * 60 + startTime.getMinutes();
            const toMinutes = endTime.getHours() * 60 + endTime.getMinutes();

            // console.log(`Converted appointment: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()} => ${fromMinutes}-${toMinutes} minutes`);

            return {
                from: fromMinutes,
                to: toMinutes,
                appointmentId: appointment._id
            };
        });

        // Convert available slots to minutes for easier calculation
        const availableSlotsInMinutes = daySlots.map(slot => {
            const fromMin = timeToMinutes(slot.from);
            const toMin = timeToMinutes(slot.to);
            // console.log(`Converting available slot: ${slot.from}-${slot.to} => ${fromMin}-${toMin} minutes`);
            return {
                from: fromMin,
                to: toMin
            };
        });

        // Subtract booked slots from available slots
        const availableAfterBooking = [];
        // console.log(`\n===== PROCESSING SLOT DEDUCTIONS =====`);

        for (const availableSlot of availableSlotsInMinutes) {
            // console.log(`\nProcessing available slot: ${minutesToTime(availableSlot.from)}-${minutesToTime(availableSlot.to)}`);

            // Start with the full available slot
            let remainingSlots = [{ from: availableSlot.from, to: availableSlot.to }];
            // console.log(`Starting with remaining slot: ${minutesToTime(availableSlot.from)}-${minutesToTime(availableSlot.to)}`);

            // Process each booked appointment
            for (const bookedSlot of bookedSlots) {
                // console.log(`\n  Checking against booked slot: ${minutesToTime(bookedSlot.from)}-${minutesToTime(bookedSlot.to)}`);
                const newRemainingSlots = [];

                for (const remainingSlot of remainingSlots) {
                    // console.log(`  Evaluating remaining slot: ${minutesToTime(remainingSlot.from)}-${minutesToTime(remainingSlot.to)}`);

                    // Case 1: Booked slot is completely outside this available slot
                    if (bookedSlot.to <= remainingSlot.from || bookedSlot.from >= remainingSlot.to) {
                        // console.log(`  Case 1: Booked slot is outside - keeping slot intact`);
                        newRemainingSlots.push(remainingSlot);
                        continue;
                    }

                    // Case 2: Booked slot starts before available slot and ends within it
                    if (bookedSlot.from <= remainingSlot.from && bookedSlot.to > remainingSlot.from && bookedSlot.to < remainingSlot.to) {
                        // console.log(`  Case 2: Booked slot starts before and ends within - keeping ${minutesToTime(bookedSlot.to)}-${minutesToTime(remainingSlot.to)}`);
                        newRemainingSlots.push({ from: bookedSlot.to, to: remainingSlot.to });
                        continue;
                    }

                    // Case 3: Booked slot starts within available slot and ends after it
                    if (bookedSlot.from > remainingSlot.from && bookedSlot.from < remainingSlot.to && bookedSlot.to >= remainingSlot.to) {
                        // console.log(`  Case 3: Booked slot starts within and ends after - keeping ${minutesToTime(remainingSlot.from)}-${minutesToTime(bookedSlot.from)}`);
                        newRemainingSlots.push({ from: remainingSlot.from, to: bookedSlot.from });
                        continue;
                    }

                    // Case 4: Booked slot is completely within available slot
                    if (bookedSlot.from > remainingSlot.from && bookedSlot.to < remainingSlot.to) {
                        // console.log(`  Case 4: Booked slot is within - splitting to ${minutesToTime(remainingSlot.from)}-${minutesToTime(bookedSlot.from)} and ${minutesToTime(bookedSlot.to)}-${minutesToTime(remainingSlot.to)}`);
                        newRemainingSlots.push({ from: remainingSlot.from, to: bookedSlot.from });
                        newRemainingSlots.push({ from: bookedSlot.to, to: remainingSlot.to });
                        continue;
                    }

                    // Case 5: Booked slot completely covers available slot
                    if (bookedSlot.from <= remainingSlot.from && bookedSlot.to >= remainingSlot.to) {
                        // console.log(`  Case 5: Booked slot completely covers available slot - removing slot`);
                        // This slot is completely booked, don't add anything
                        continue;
                    }
                }

                // Update remaining slots for next iteration
                remainingSlots = newRemainingSlots;
                // console.log(`  After processing this booked slot, remaining slots: ${remainingSlots.map(s => `${minutesToTime(s.from)}-${minutesToTime(s.to)}`).join(', ') || 'none'}`);
            }

            // Add all remaining slots to the result
            availableAfterBooking.push(...remainingSlots);
            // console.log(`After processing all booked slots, adding to final result: ${remainingSlots.map(s => `${minutesToTime(s.from)}-${minutesToTime(s.to)}`).join(', ') || 'none'}`);
        }

        // console.log(`\n===== MERGING FINAL SLOTS =====`);
        // console.log(`Available slots after booking (before merging): ${availableAfterBooking.map(s => `${minutesToTime(s.from)}-${minutesToTime(s.to)}`).join(', ') || 'none'}`);

        // Merge adjacent or overlapping slots
        if (availableAfterBooking.length > 0) {
            // Sort by start time
            availableAfterBooking.sort((a, b) => a.from - b.from);
            // console.log(`Sorted slots: ${availableAfterBooking.map(s => `${minutesToTime(s.from)}-${minutesToTime(s.to)}`).join(', ')}`);

            const mergedSlots = [availableAfterBooking[0]];

            for (let i = 1; i < availableAfterBooking.length; i++) {
                const currentSlot = availableAfterBooking[i];
                const lastMergedSlot = mergedSlots[mergedSlots.length - 1];

                // console.log(`Checking if ${minutesToTime(currentSlot.from)}-${minutesToTime(currentSlot.to)} should merge with ${minutesToTime(lastMergedSlot.from)}-${minutesToTime(lastMergedSlot.to)}`);

                // If current slot overlaps or is adjacent to last merged slot
                if (currentSlot.from <= lastMergedSlot.to) {
                    // console.log(`Merging slots - extending end time to ${minutesToTime(Math.max(lastMergedSlot.to, currentSlot.to))}`);
                    lastMergedSlot.to = Math.max(lastMergedSlot.to, currentSlot.to);
                } else {
                    // console.log(`Adding new slot ${minutesToTime(currentSlot.from)}-${minutesToTime(currentSlot.to)}`);
                    mergedSlots.push(currentSlot);
                }
            }

            // console.log(`After merging: ${mergedSlots.map(s => `${minutesToTime(s.from)}-${minutesToTime(s.to)}`).join(', ')}`);

            // Convert back to time strings and filter minimum duration
            const finalAvailability = mergedSlots
                .filter(slot => {
                    const duration = slot.to - slot.from;
                    const keep = duration >= 30;
                    // console.log(`Slot ${minutesToTime(slot.from)}-${minutesToTime(slot.to)} duration: ${duration} minutes - ${keep ? 'keeping' : 'removing'}`);
                    return keep;
                })
                .map(slot => ({
                    from: minutesToTime(slot.from),
                    to: minutesToTime(slot.to)
                }));

            // console.log(`Final availability slots: ${JSON.stringify(finalAvailability)}`);

            return {
                specializations,
                date,
                dayOfWeek,
                availability: finalAvailability
            };
        }

        // console.log(`No available slots remaining after deducting booked appointments`);
        return {
            specializations,
            date,
            dayOfWeek,
            availability: []
        };
    } catch (error) {
        // console.error(`ERROR in getAvailableTimeSlotsForDate: ${error.message}`, error);
        throw error;
    }
}

export async function getAppointmentDetailsHandler(input) {
    return await appointmentHelper.getObjectById(input);
}

export async function updateAppointmentDetailsHandler(input) {
    return await appointmentHelper.directUpdateObject(input.objectId, input.updateObject);
}

export async function getAppointmentListHandler(input) {
    const list = await appointmentHelper.getAllObjects(input);
    const count = await appointmentHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteAppointmentHandler(input) {
    return await appointmentHelper.deleteObjectById(input);
}

export async function getAppointmentByQueryHandler(input) {
    return await appointmentHelper.getObjectByQuery(input);
}
