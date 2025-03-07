import Joi from 'joi';

const options = {
    errors: {
        wrap: {
            label: '',
        },
    },
};

export const validateSignUp = (userData: any) => {
    const schema = Joi.object({
        id: Joi.string()
            .guid({ version: 'uuidv4' })
            .optional()
            .messages({ 'string.guid': 'User ID must be in UUID format' }),
        first_name: Joi.string().min(1).required().messages({
            'string.min': 'First name should at least minimum 1 character',
            'any.required': 'First name is required',
        }),
        last_name: Joi.string().min(1).required().messages({
            'string.min': 'Last name should at least minimum 1 character',
            'any.required': 'Last name is required',
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Email format is invalid',
            'any.required': 'Email is required',
        }),
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

export const validateSignIn = (userData: any) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email format is invalid',
            'any.required': 'Email is required',
        }),
        password: Joi.string().required(),
        device_id: Joi.string().required().messages({
            'any.required': 'Device ID is required',
        }),
        device_name: Joi.string().optional().default('Unknown Device'),
        device_model: Joi.string().optional().default('Unknown Model'),
    });

    return schema.validate(userData, options);
};
