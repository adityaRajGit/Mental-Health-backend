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

    const message = `Your OTP is: ${otp}. It is valid for 10 minutes.`;

    const mailOptions = {
      from: configVariables.EMAIL_USER,
      to: email,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.log("Error sending email:", error);
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
    console.log("Email sent to:", email);
  } catch (error) {
    console.log("Error sending email:", error);
  }
}

export async function sendContactSupportEmail({ name, email,phone, company, numEmployees, message }) {
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
        Number of Employees: ${numEmployees}
        How can we help?: ${message}`.trim(),
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Contact/support email sent successfully" };
  } catch (error) {
    console.error("Error sending contact/support email:", error);
    throw error;
  }
}