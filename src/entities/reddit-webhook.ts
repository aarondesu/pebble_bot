import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity()
export default class RedditWebhook extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  webhookId!: string;

  @Column({})
  clientId!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  webhookUrl!: string;

  @Column()
  subreddit!: string;

  @Column()
  channelId!: string;

  @Column({ nullable: true })
  latestPostId!: string;
}
