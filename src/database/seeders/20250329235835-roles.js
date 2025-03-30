'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('roles', [
            {
                id: 1,
                role_name: 'admin',
                created_at: '2025-03-29 21:44:28.371 +0800',
                updated_at: '2025-03-29 21:44:28.371 +0800',
            },
            {
                id: 2,
                role_name: 'internal-moderator',
                created_at: '2025-03-29 21:45:05.755 +0800',
                updated_at: '2025-03-29 21:45:05.755 +0800',
            },
            {
                id: 3,
                role_name: 'user',
                created_at: '2025-03-29 21:46:28.155 +0800',
                updated_at: '2025-03-29 21:46:28.155 +0800',
            },
        ]);
    },
};
