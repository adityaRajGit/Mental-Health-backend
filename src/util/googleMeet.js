import { google } from "googleapis";
import { readFileSync } from "fs";
import path from "path";

const KEYFILEPATH = path.join(process.cwd(), "service-account.json"); 
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const calendarId = process.env.GOOGLE_CALENDAR_ID;

export async function createGoogleMeetEvent({ summary, description, startTime, endTime }) {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary,
    description,
    start: { dateTime: startTime },
    end: { dateTime: endTime },
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).substring(2),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId,
    resource: event,
    conferenceDataVersion: 1,
  });

  return response.data.hangoutLink; 
}