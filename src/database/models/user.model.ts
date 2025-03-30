import { User } from '@/interfaces/user.interface';
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export type UserCreationAttributes = Optional<User, 'id' | 'email'>;

export class UserModel
    extends Model<User, UserCreationAttributes>
    implements User
{
    public id!: string;
    public firebase_id!: string;
    public google_id!: string;
    public email!: string;
    public first_name!: string;
    public last_name!: string;
    public image!: string;
    public role_id!: number;
    public phone_number!: string;
    public password!: string;
    public otp_code!: string;
    public otp_expiration!: Date;
    public is_verified!: boolean;
    public created_at: string | undefined;
    public updated_at: string | undefined;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof UserModel {
    UserModel.init(
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUIDV4,
                defaultValue: DataTypes.UUIDV4,
            },
            firebase_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            google_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                allowNull: false,
                type: DataTypes.STRING,
                unique: true,
            },
            first_name: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            last_name: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            image: {
                allowNull: true,
                type: DataTypes.STRING,
            },
            role_id: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: 'roles',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            phone_number: {
                allowNull: true,
                type: DataTypes.STRING,
            },
            password: {
                allowNull: false,
                type: DataTypes.STRING(255),
            },
            otp_code: {
                allowNull: true,
                type: DataTypes.STRING,
            },
            otp_expiration: {
                allowNull: true,
                type: DataTypes.DATE,
            },
            is_verified: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        {
            tableName: 'users',
            sequelize,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            timestamps: true,
        },
    );

    return UserModel;
}
