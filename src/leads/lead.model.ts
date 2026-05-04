import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

export type InquiryType = "client" | "general";

@Table({
  tableName: "leads",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export class Lead extends Model<Lead> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false, field: "full_name" })
  declare fullName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare company: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare phone: string | null;

  @Column({ type: DataType.STRING, allowNull: false, field: "inquiry_type" })
  declare inquiryType: InquiryType;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare message: string;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, allowNull: false, field: "crm_synced" })
  declare crmSynced: boolean;
}
