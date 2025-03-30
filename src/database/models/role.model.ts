import { Role } from '@/interfaces/role.interface';
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type RoleCreationAttributes = Optional<Role, 'id'>;

export class RoleModel
    extends Model<Role, RoleCreationAttributes>
    implements Role
{
    public id!: number;
    public role_name!: string;
    public created_at: string | undefined;
    public updated_at: string | undefined;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof RoleModel {
    RoleModel.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            role_name: {
                type: DataTypes.STRING(45),
                allowNull: false,
                unique: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'roles',
            sequelize,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            timestamps: true,
        },
    );
    return RoleModel;
}
