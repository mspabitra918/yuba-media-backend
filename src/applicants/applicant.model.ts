import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

export type ApplicantStatus = "new" | "review" | "interview" | "rejected";

@Table({
  tableName: "applicants",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export class Applicant extends Model<Applicant> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false, field: "full_name" })
  declare fullName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare phone: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare position: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare experience: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare location: string;

  @Column({ type: DataType.TEXT, allowNull: false, field: "cv_url" })
  declare cvUrl: string;

  @Column({ type: DataType.TEXT, allowNull: true, field: "cover_letter" })
  declare coverLetter: string | null;

  @Column({ type: DataType.STRING, allowNull: true, field: "linkedin_url" })
  declare linkedinUrl: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare availability: string | null;

  @Default("new")
  @Column({ type: DataType.STRING, allowNull: false })
  declare status: ApplicantStatus;
}
