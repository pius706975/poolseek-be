'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
                primaryKey: true,
            },
            firebase_id: {
                type: Sequelize.STRING,
                allowNull: true
            },
            google_id: {
                type: Sequelize.STRING,
                allowNull: true
            },
            email: {
                type: Sequelize.STRING(45),
                allowNull: false,
                unique: true,
            },
            first_name: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            last_name: {
                type: Sequelize.STRING(45),
                allowNull: false,
            },
            image: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            role_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: 'roles',  
                  key: 'id',
                },
                onUpdate: 'CASCADE',  
                onDelete: 'SET NULL', 
              },
            phone_number: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            otp_code: {
                type: Sequelize.STRING,
                allowNull: true,  
            },
            otp_expiration: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            is_verified: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            created_at: {  
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {  
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    },
};
