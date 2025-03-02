import Joi from 'joi';

const options = {
    errors: {
        wrap: {
            label: '',
        },
    },
};

export const validateCreateRole = (roleData: any) => {
    const schema = Joi.object({
        role_name: Joi.string().required().messages({
            'string.min': 'Role name should at least minimum 1 character',
            'any.required': 'Role name is required',
        }),
    });

    return schema.validate(roleData, options);
};
