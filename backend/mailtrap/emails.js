import {mailtrapClient, sender} from './mailtrap.config.js';
import {PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE} from './emailTemplates.js';

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        });

        console.log("Email sent successfully", response);
    } 
    catch (error) {
        console.error(`Error sending verification: ${error}`);
        throw new Error(`Error sending verification email: ${error}`);
    }
}

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "74783b5d-6e2d-49da-9aa1-9001eaf2e9fb",
            template_variables: {
                "company_info_name": "SIH Project",
                "name": name
            }
        });

        console.log("Welcome email sent successfully", response);
    } 
    catch (error) {
        console.log(`Error sending welcome email: ${error}`);
    }
}

export const sendResetPasswordEmail = async (email, resetURL) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset"
        });

        console.log("Email sent successfully", response);
    } 
    catch (error) {
        console.error(`Error sending reset password email: ${error}`);
        throw new Error(`Error sending reset password email: ${error}`);
    }
}

export const sendResetSuccessEmail = async (email) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        });

        console.log("Password Reset Success email sent successfully", response);
    } 
    catch (error) {
        console.error(`Error sending reset password success email: ${error}`);
        throw new Error(`Error sending reset password success email: ${error}`);
    }
}