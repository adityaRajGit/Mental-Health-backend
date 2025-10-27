import replaceall from "replaceall";
import _ from "lodash";
import nodemailer from "nodemailer";
import configVariables from "../../server/config";
import otpHelper from "../helpers/otp.helper";

export function sanitizeCountryCode(text) {
  if (text) {
    return replaceall("+", "", text); // text.replace('+', '')
  }
  return "";
}

export function getUserInfo(user) {
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    profile_image: user.profile_image,
    created_at: user.created_at
  };
}

export function getAdminInfo(user) {
  return {
    _id: user._id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    role: user.role,
  };
}

export function generateOtp(range) {
  var add = 1,
    max = 12 - add;
  if (range > max) {
    return generate(max) + generate(n - max);
  }
  max = Math.pow(10, range + add);
  var min = max / 10;
  var number = Math.floor(Math.random() * (max - min + 1)) + min;
  return ("" + number).substring(add);
}

export function generateOtpExpireDate() {
  var date = new Date();
  var otpExpiry = new Date(date);
  otpExpiry.setMinutes(date.getMinutes() + 40);
  return otpExpiry;
}

export function getDateMinutesDifference(date) {
  var countDownDate = new Date(date).getTime();
  const currentDate = new Date().getTime();
  var diff = Math.abs(currentDate - countDownDate);
  var minutes = Math.floor(diff / 1000 / 60);
  return minutes;
}

export async function verifyEmailOTP(email, otp) {
  try {
    const otpRecord = await otpHelper.getObjectByQuery({
      query: { email, otp },
    });

    if (!otpRecord) {
      throw "Invalid OTP";
    }

    if (new Date() > otpRecord.expiresAt) {
      await otpHelper.deleteObjectByQuery({ email, otp });
      throw "OTP has expired";
    }

    await otpHelper.deleteObjectByQuery({ email });

    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    console.log("Error verifying email:", error);
    throw error;
  }
}


export async function sendEmailNotification(email, subject, message) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: configVariables.EMAIL_USER,
        pass: configVariables.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: configVariables.EMAIL_USER,
      to: email,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    // console.log("Email sent to:", email);
  } catch (error) {
    console.log("Error sending email:", error);
  }
}

export async function sendContactSupportEmail({ name, email, phone, company, employees, message }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: configVariables.EMAIL_USER,
        pass: configVariables.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: configVariables.EMAIL_USER,
      to: "milind.unfiltered@gmail.com", // send to your support inbox
      subject: "New Contact/Support Request",
      replyTo: email,
      text: `
        New Contact/Support Request

        Name: ${name}
        Work Email: ${email}
        Phone: ${phone}
        Company Name: ${company}
        Number of Employees: ${employees}
        How can we help?: ${message}`.trim(),
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Contact/support email sent successfully" };
  } catch (error) {
    console.error("Error sending contact/support email:", error);
    throw error;
  }
}

export async function sendVerificationEmail(email, subject) {
  try {
    // Generate OTP
    const otp = generateOtp(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await otpHelper.updateOneAndUpdate({
      query: { email },
      updateQuery: {
        otp,
        expiresAt,
        created_at: new Date(),
        updated_at: new Date(),
      },
      options: { upsert: true, new: true },
    });

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: configVariables.EMAIL_USER,
        pass: configVariables.EMAIL_PASS,
      },
    });
    const htmlMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - StayUnfiltered</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdfa; color: #333333;">
      
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 150, 137, 0.15);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #009689 0%, #00a693 100%); padding: 40px 30px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
            <span style="color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Stay</span>
            <span style="color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: -0.5px; margin-left: 8px;">Unfiltered</span>
          </div>
          <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0 0; font-size: 16px; font-weight: 400;">
            Your Safe Space for Mental Wellness
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          
          <!-- Greeting -->
          <h2 style="color: #009689; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
            Welcome to Your Healing Journey
          </h2>
          
          <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
            Hello there! 🌿<br><br>
            Thank you for choosing <strong style="color: #009689;">StayUnfiltered</strong> as your trusted companion on your mental wellness journey. We're here to provide you with a safe, supportive space to heal and grow. Let's start by verifying your email address.
          </p>

          <!-- OTP Box -->
          <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border: 2px solid #009689; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="color: #009689; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
              Your Verification Code
            </p>
            <div style="background: #ffffff; border: 2px dashed #009689; border-radius: 8px; padding: 20px; margin: 15px 0;">
              <span style="color: #009689; font-size: 36px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </span>
            </div>
            <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 14px;">
              ⏰ <strong>Expires in 10 minutes</strong>
            </p>
          </div>

          <!-- Instructions -->
          <div style="background: #f0fdfa; border-left: 4px solid #5eead4; padding: 20px; border-radius: 6px; margin: 30px 0;">
            <h3 style="color: #0f766e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
              🌱 How to complete verification:
            </h3>
            <ul style="color: #134e4a; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
              <li>Copy the 6-digit verification code above</li>
              <li>Return to the StayUnfiltered verification page</li>
              <li>Enter the code to activate your account</li>
              <li>Begin your personalized wellness journey</li>
            </ul>
          </div>

          <!-- What's Next -->
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
              🌈 Your wellness journey awaits:
            </h3>
            <ul style="color: #065f46; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
              <li>Connect with licensed, compassionate therapists</li>
              <li>Access personalized mental health resources</li>
              <li>Join a supportive community that understands</li>
              <li>Explore evidence-based wellness tools</li>
              <li>Track your progress in a judgment-free space</li>
            </ul>
          </div>

          <!-- Wellness Philosophy -->
          <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #0d9488; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
              💚 Our Promise to You:
            </h3>
            <p style="color: #0f766e; margin: 0; font-size: 14px; line-height: 1.5;">
              At StayUnfiltered, we believe in authentic healing. Your mental health matters, and we're committed to providing a space where you can be your true self without judgment. Every step forward, no matter how small, is worth celebrating.
            </p>
          </div>

          <!-- Security Note -->
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="color: #dc2626; margin: 0; font-size: 14px; font-weight: 500;">
              🔒 <strong>Your Privacy is Sacred:</strong>
            </p>
            <p style="color: #7f1d1d; margin: 10px 0 0 0; font-size: 14px; line-height: 1.4;">
              We protect your personal information with the highest security standards. Never share this verification code with anyone. StayUnfiltered will never ask for your code via phone or unsolicited contact.
            </p>
          </div>

          <!-- Support -->
          <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; text-align: center;">
            Need support or have questions? 🤝<br>
            Our caring team is here for you 24/7. You're never alone on this journey.
          </p>

        </div>

        <!-- Footer -->
        <div style="background: #f0fdfa; padding: 30px; text-align: center; border-top: 1px solid #a7f3d0;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            <span style="color: #009689; font-size: 18px; font-weight: 700;">Stay</span>
            <span style="color: #009689; font-size: 18px; font-weight: 300; margin-left: 4px;">Unfiltered</span>
          </div>
          <p style="color: #0f766e; margin: 0 0 5px 0; font-size: 12px; font-style: italic;">
            "Healing happens when we feel safe to be ourselves"
          </p>
          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 12px;">
            © 2025 StayUnfiltered. All rights reserved.
          </p>
          <p style="color: #6b7280; margin: 0; font-size: 11px;">
            This email was sent to ${email}. If you didn't create an account, please ignore this message.
          </p>
        </div>

      </div>

      <!-- Mobile Responsiveness -->
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
          .padding { padding: 20px !important; }
          .otp-code { font-size: 28px !important; letter-spacing: 4px !important; }
        }
      </style>

    </body>
    </html>
    `;

    const textMessage = `
    🌿 STAYUNFILTERED - Email Verification
    
    Hello there! 
    
    Welcome to StayUnfiltered! Thank you for choosing us as your trusted companion on your mental wellness journey.
    
    Your Verification Code: ${otp}
    
    ⏰ This code expires in 10 minutes.
    
    How to verify:
    1. Copy the code above
    2. Return to the StayUnfiltered verification page  
    3. Enter the code to activate your account
    4. Begin your personalized wellness journey
    
    Your wellness journey awaits:
    • Connect with licensed, compassionate therapists
    • Access personalized mental health resources
    • Join a supportive community that understands
    • Explore evidence-based wellness tools
    
    Our Promise: At StayUnfiltered, we believe in authentic healing. Your mental health matters.
    
    🔒 Privacy Note: We protect your information with the highest security standards. Never share this code.
    
    Need support? Our caring team is here for you 24/7.
    
    © 2025 StayUnfiltered. "Healing happens when we feel safe to be ourselves"
    `;

    const mailOptions = {
      from: `"StayUnfiltered" <${configVariables.EMAIL_USER}>`,
      to: email,
      subject,
      text: textMessage,
      html: htmlMessage,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent successfully" };
  }
  catch(e)
  {

  }
}

export async function sendAppointmentEmail(email, userName, therapistName, appointmentTime,meetLink) {
    
  try {
          const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                  user: configVariables.EMAIL_USER,
                  pass: configVariables.EMAIL_PASS,
              },
          });


    
    const htmlMessage = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Appointment Confirmed - StayUnfiltered</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdfa; color: #333333;">
              
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 150, 137, 0.15);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #009689 0%, #00a693 100%); padding: 40px 30px; text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                    <span style="color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Stay</span>
                    <span style="color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: -0.5px; margin-left: 8px;">Unfiltered</span>
                  </div>
                  <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0 0; font-size: 16px; font-weight: 400;">
                    Your Safe Space for Mental Wellness
                  </p>
                </div>

                <!-- Main Content -->
                <div style="padding: 40px 30px;">
                  
                  <!-- Greeting -->
                  <h2 style="color: #009689; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                    Appointment Confirmed 🎉
                  </h2>
                  
                  <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                    Hi <strong>${userName}</strong>,<br><br>
                    Your appointment has been successfully scheduled with <strong style="color: #009689;">${therapistName}</strong>.
                  </p>

                  <!-- Appointment Details -->
                  <div style="background: #ecfdf5; border: 2px solid #009689; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                    <p style="color: #009689; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
                      Appointment Details
                    </p>
                    <div style="background: #ffffff; border: 2px dashed #009689; border-radius: 8px; padding: 20px; margin: 15px 0;">
                      <p style="color: #009689; font-size: 18px; font-weight: 700; margin: 0;">Therapist: ${therapistName}</p>
                      <p style="color: #009689; font-size: 18px; font-weight: 700; margin: 10px 0 0;">Time: ${appointmentTime}</p>
                      ${meetLink ? `
                      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #a7f3d0;">
                        <p style="color: #0f766e; font-size: 14px; margin: 0 0 10px 0;">Join your session:</p>
                        <a href="${meetLink}" style="display: inline-block; background: #009689; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Join Meet
                        </a>
                      </div>
                      ` : ''}
                    </div>
                    <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 14px;">
                      Please join on time to make the most of your session.
                    </p>
                  </div>

                  <!-- Next Steps -->
                  <div style="background: #f0fdfa; border-left: 4px solid #5eead4; padding: 20px; border-radius: 6px; margin: 30px 0;">
                    <h3 style="color: #0f766e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                      🌱 Before your session:
                    </h3>
                    <ul style="color: #134e4a; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
                      <li>Find a quiet, comfortable space</li>
                      <li>Ensure a stable internet connection (for online sessions)</li>
                      <li>Bring a notebook if you'd like to take notes</li>
                      <li>Take a deep breath — you’re in safe hands</li>
                    </ul>
                  </div>

                  <!-- Support -->
                  <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; text-align: center;">
                    Need to reschedule or have questions? 🤝<br>
                    Our caring team is here for you 24/7. You're never alone on this journey.
                  </p>

                </div>

                <!-- Footer -->
                <div style="background: #f0fdfa; padding: 30px; text-align: center; border-top: 1px solid #a7f3d0;">
                  <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                    <span style="color: #009689; font-size: 18px; font-weight: 700;">Stay</span>
                    <span style="color: #009689; font-size: 18px; font-weight: 300; margin-left: 4px;">Unfiltered</span>
                  </div>
                  <p style="color: #0f766e; margin: 0 0 5px 0; font-size: 12px; font-style: italic;">
                    "Healing happens when we feel safe to be ourselves"
                  </p>
                  <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 12px;">
                    © 2025 StayUnfiltered. All rights reserved.
                  </p>
                  <p style="color: #6b7280; margin: 0; font-size: 11px;">
                    This email was sent to ${email}. If you didn’t book this appointment, please contact our support team.
                  </p>
                </div>

              </div>
            </body>
            </html>
`;


    const textMessage = `
        🌿 STAYUNFILTERED - Appointment Confirmed

        Hi ${userName}, 

        Your appointment has been successfully scheduled.

        Therapist: ${therapistName}  
        Time: ${appointmentTime}  

        Please join on time to make the most of your session.
        
        Meet Link : ${meetLink}

        🌱 Before your session:
        1. Find a quiet, comfortable space
        2. Ensure a stable internet connection (for online sessions)
        3. Bring a notebook if you'd like to take notes
        4. Take a deep breath — you’re in safe hands

        Need to reschedule or have questions? Our caring team is here for you 24/7.

        © 2025 StayUnfiltered. "Healing happens when we feel safe to be ourselves"
        `;


    const mailOptions = {
            from: `"StayUnfiltered" <${configVariables.EMAIL_USER}>`,
            to: email,
            subject: "Appointment Confirmed - StayUnfiltered",
            text: textMessage,
            html: htmlMessage,
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: "Appointment email sent successfully" };
    } catch (error) {
        console.error("Error sending appointment email:", error);
        throw error;
    }
}



