import Joi from 'joi';

const options = {
    errors: {
        wrap: {
            label: '',
        },
    },
};

export const validateSendOTP = (email: string) => {
    const emailData = { email };
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email format is invalid',
            'any.required': 'Email is required',
        }),
    });

    return schema.validate(emailData, options);
};

export const validateVerifyOTP = (userData: any) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email format is invalid',
            'any.required': 'Email is required',
        }),
        otp_code: Joi.string().required().messages({
            'any.required': 'OTP code is required',
        }),
    });

    return schema.validate(userData, options);
};
