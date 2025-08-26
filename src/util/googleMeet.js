import { google } from "googleapis";
import fs from "fs";
import path from "path";

/**
 * Creates a Google Meet event and returns the meeting link
 */
export async function createGoogleMeetEvent(options = {}) {
  try {
    // Get service account credentials
    const credentials = getCredentials();
    if (!credentials) {
      throw new Error("Service account credentials not found");
    }
    
    // console.log("Service account email:", credentials.client_email);
    // console.log("Project ID:", credentials.project_id);
    
    // Create auth client using JWT - FIXING THE AUTH INITIALIZATION
    // console.log("Creating JWT auth client...");
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });
    
    // This is critical - authorize before using the API
    // console.log("Authorizing JWT...");
    try {
      const authResult = await auth.authorize();
      // console.log("Auth successful. Token expires:", new Date(authResult.expiry_date).toISOString());
    } catch (authError) {
      console.error("Authorization failed:", authError.message);
      throw new Error("JWT authorization failed: " + authError.message);
    }
    
    // Create Calendar client
    // console.log("Creating Calendar client...");
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Test if we can access the calendar API at all
    try {
      // console.log("Testing calendar API access...");
      const calendarList = await calendar.calendarList.list();
      // console.log("Available calendars:", calendarList.data.items.map(cal => ({ id: cal.id, summary: cal.summary })));
    } catch (listError) {
      console.error("Cannot list calendars:", listError.message);
      // console.log("Calendar API may not be enabled or service account lacks permissions.");
    }
    
    // Format meeting details
    const event = {
      summary: options.summary || 'Therapy Session',
      description: options.description || 'Your scheduled therapy appointment',
      start: {
        dateTime: typeof options.startTime === 'string' ? options.startTime : options.startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: typeof options.endTime === 'string' ? options.endTime : options.endTime.toISOString(),
        timeZone: 'UTC',
      },
      // Add attendees if provided
      attendees: options.attendees ? options.attendees.map(email => ({ email })) : [],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };
    
    // console.log("Calendar event payload:", JSON.stringify(event, null, 2));
    
    try {
      // First attempt: Try using a specific email address
      const userEmail = 'stay.unfiltered.2025@gmail.com';
      // console.log(`Attempting to create event in calendar: ${userEmail}`);
      
      const response = await calendar.events.insert({
        calendarId: userEmail,
        resource: event,
        conferenceDataVersion: 1
      });
      
      // console.log("Calendar event created successfully!");
      // console.log("Response:", JSON.stringify(response.data, null, 2));
      
      // Extract the Meet link
      const meetLink = response.data.conferenceData?.entryPoints?.find(
        ep => ep.entryPointType === 'video'
      )?.uri;
      
      if (meetLink) {
        // console.log("Google Meet link created:", meetLink);
        return meetLink;
      }
      throw new Error("No meet link found in the response");
      
    } catch (calendarError) {
      console.error("Error with first calendar attempt:", calendarError.message);
      if (calendarError.errors) {
        console.error("Detailed errors:", JSON.stringify(calendarError.errors, null, 2));
      }
      
      // Second attempt: Try using 'primary' calendar
      try {
        // console.log("Attempting to create event in 'primary' calendar");
        const response = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
          conferenceDataVersion: 1
        });
        
        // console.log("Primary calendar event created successfully!");
        // console.log("Response:", JSON.stringify(response.data, null, 2));
        
        const meetLink = response.data.conferenceData?.entryPoints?.find(
          ep => ep.entryPointType === 'video'
        )?.uri;
        
        if (meetLink) {
          // console.log("Google Meet link created:", meetLink);
          return meetLink;
        }
        throw new Error("No meet link found in the response");
        
      } catch (primaryCalendarError) {
        console.error("Error with primary calendar attempt:", primaryCalendarError.message);
        if (primaryCalendarError.errors) {
          console.error("Detailed errors:", JSON.stringify(primaryCalendarError.errors, null, 2));
        }
        throw new Error("Failed to create Google Meet link with all methods");
      }
    }
  } catch (error) {
    console.error('Error creating Google Meet link:', error.message);
    
    // Fall back to Jitsi Meet only when Google Meet fails
    // console.log("Falling back to Jitsi Meet...");
    const meetingId = generateMeetingId();
    return `https://meet.jit.si/${meetingId}`;
  }
}

/**
 * Generates a random meeting ID
 */
function generateMeetingId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  
  // First part: 3 letters
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  result += '-';
  
  // Second part: 4 letters
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  result += '-';
  
  // Third part: 3 letters
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Gets credentials from the service account file
 */
function getCredentials() {
  try {
    const credentialsPath = path.join(process.cwd(), 'service-account.json');
    if (fs.existsSync(credentialsPath)) {
      return JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    }
    return null;
  } catch (error) {
    console.error('Error reading credentials:', error);
    return null;
  }
}