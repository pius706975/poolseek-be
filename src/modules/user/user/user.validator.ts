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

export const validateUpdatePassword = (userData: any) => {
    const schema = Joi.object({
        password: Joi.string()
            .min(8)
            .pattern(
                new RegExp(
                    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).+$',
                ),
            )
            .required()
            .messages({
                'string.min': 'Password must have at least 8 characters.',
                'string.pattern.base':
                    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
                'any.required': 'Password is required.',
            }),
    });

    return schema.validate(userData, options);
};
