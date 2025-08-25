import appointmentHelper from '../../helpers/appointment.helper';
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

export async function getUpcomingAppointmentsByUserHandler(userId) {
    try {
        const now = new Date();

        const userAppointments = await appointmentHelper.getAllObjects({
            query: {
                user_id: userId,
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

        if (userAppointments.length === 0) return [];

        const upcomingAppointments = userAppointments.filter(appointment => {
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

export async function getPastAppointmentsByUserHandler(userId) {
    try {
        const now = new Date();

        const userAppointments = await appointmentHelper.getAllObjects({
            query: {
                user_id: userId,
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
    const meetLink = await createGoogleMeetEvent({
        summary: "Therapy Session",
        description: "Your scheduled therapy appointment",
        startTime: input.scheduled_at,
        endTime: new Date(new Date(input.scheduled_at).getTime() + (input.duration || 60) * 60000).toISOString(),
        attendees: input.attendees || [] // You can add attendee emails here if available
    });

    input.meet_link = meetLink;

    return await appointmentHelper.addObject(input);
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
