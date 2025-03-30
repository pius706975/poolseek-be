'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        // User password is User@123
        await queryInterface.bulkInsert('users', [
            {
                email: 'piusrestiantoro2@gmail.com',
                first_name: 'Pius',
                last_name: 'Restiantoro',
                role_id: 3,
                password: '$2b$10$yIt2WPCM5H/.HRPGoAhPAOiqQaCzVrRpwBto9QQU1hM5iCpDI6LZG',
                is_verified: true,
                created_at: '2025-03-30 08:38:17.562 +0800',
                updated_at: '2025-03-30 08:53:39.685 +0800'
            },

            // {
            //     firebase_id: '',
            //     google_id: '',
            //     email: '',
            //     first_name: '',
            //     last_name: '',
            //     image: '',
            //     role_id: ,
            //     phone_number: '',
            //     password: '',
            //     is_verified: ,
            //     created_at: '',
            //     updated: ''
            // }
        ])
    },
};
