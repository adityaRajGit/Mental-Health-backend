export const getEmailTemplate = (username, url) => {
  const template = `
    <div class="container-fluid">
        <div style="padding: 35px 20px 35px 20px;background: #202738;">
            <h3 style="font-family: 'Poppins';font-style: normal;font-weight: 500;font-size: 34px;line-height: 72px;text-align: center;letter-spacing: -0.5px;color: #FFFFFF;">Hi ${username} </h3>

            <p style="font-family: 'Poppins';font-style: normal;font-weight: 500;font-size: 24px;line-height: 170%;text-align: center;color: #FFFFFF;"> We just received a request to change the password for your account.
                <br />
                To reset the password, please click on the button below.</p>
        </div>
        <div class="text-center" style="margin-top: 30px;">
            <h3 style="font-family: 'Poppins';font-style: normal;font-weight: 600;font-size: 34px;line-height: 51px;text-align: center;color: rgba(0, 0, 0, 0.87);">Reset Password</h3>
            <p style="font-family: 'Poppins';font-style: normal;font-weight: 500;font-size: 24px;line-height: 36px;text-align: center;letter-spacing: 0.25px;color: rgba(50, 50, 50, 0.67);">Click on the link below to login:</p>
            <p style="width: 770px;font-family: 'Poppins';font-style: normal;font-weight: 600;font-size: 24px;line-height: 170%;text-align: center;letter-spacing: 0.25px;color: #202738;margin: auto;"> <a
            href="${url}"
            style="background: #FFAE00; border-radius: 4px; font-weight: 600; font-size: 18px; letter-spacing: 0.5px; color: #FFFFFF; cursor: pointer; padding: 8px 65px; text-decoration: none;">
            Reset Password
        </a></p>
            <img src="https://ik.imagekit.io/antcreatives/reset-password-img.png?ik-sdk-version=javascript-1.4.3&updatedAt=1656140353809" />
            <p style="width: 770px;font-family: 'Poppins';font-style: normal;font-weight: 400;font-size: 20px;line-height: 170%;text-align: center;letter-spacing: 0.25px;color: rgba(0, 0, 0, 0.65);margin: auto;">If the button above does not work, please copy and paste the URL below
            into your browser instead. </p>

        </div>
        <div style="background: rgba(196, 196, 196, 0.2);padding: 30px 20px 30px 20px;margin-top: 40px;">
            <p style="font-family: 'Poppins';font-style: normal;font-weight: 400;font-size: 20px;line-height: 30px;text-align: center;color: rgba(0, 0, 0, 0.65);">Thankyou</p>
            <h6 style="font-family: 'Poppins';font-style: normal;font-weight: 600;font-size: 20px;line-height: 30px;text-align: center;color: #202738;">Visit athhub.com</h6>
        </div>
    </div>
    `;

  return template;
};
