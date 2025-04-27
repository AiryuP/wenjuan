import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Survey } from './survey.entity';

@Entity()
export class SurveyResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  surveyId: number;

  @ManyToOne(() => Survey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;

  @Column({ type: 'json' })
  answers: any;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
} 