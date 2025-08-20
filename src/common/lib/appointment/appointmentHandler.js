import appointmentHelper from '../../helpers/appointment.helper';
import { createGoogleMeetEvent } from '../../../util/googleMeet.js';

export async function addNewAppointmentHandler(input) {
    return await appointmentHelper.addObject(input);
}

export async function getAllUpcomingAppointmentsHandler() {
    const now = new Date();
    return await appointmentHelper.getAllObjects({
        query: {
            scheduled_at: { $gte: now },
            is_deleted: false
        },
        sort: { scheduled_at: 1 }
    });
}

export async function getAllPastAppointmentsHandler() {
    const now = new Date();
    return await appointmentHelper.getAllObjects({
        query: {
            scheduled_at: { $lt: now },
            is_deleted: false
        },
        sort: { scheduled_at: -1 }
    });
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
