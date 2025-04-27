import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SurveyCategory } from '../survey-category/survey-category.entity';

@Entity()
export class Survey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  status: number; // 0: 草稿, 1: 已发布, 2: 已关闭

  @Column({ default: false })
  isCollecting: boolean;

  @Column({ default: 0 })
  respondentCount: number;

  @Column({ type: 'json' })
  questions: any;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => SurveyCategory, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: SurveyCategory;

  @Column({ type: 'json', nullable: true })
  tags: number[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
} 