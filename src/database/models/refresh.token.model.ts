import { RefreshToken } from "@/interfaces/refresh.token.interfaces";
import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export type RefreshTokenCreationAttributes = Optional<RefreshToken, "id">

export class RefreshTokenModel extends Model<RefreshToken, RefreshTokenCreationAttributes> implements RefreshToken {
    public id!: string;
    public user_id!: string;
    public refresh_token!: string;
    public device_id!: string;
    public device_name!: string;
    public device_model!: string;
    public refresh_token_expiration!: Date;
    public created_at: string | undefined;
    public updated_at: string | undefined;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof RefreshTokenModel {
    RefreshTokenModel.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            refresh_token: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            device_id: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            device_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            refresh_token_expiration: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            device_model: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        {
            tableName: 'refresh_tokens',
            sequelize,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            timestamps: true,
        },
    )
    return RefreshTokenModel
}