import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Exclude, Type } from 'class-transformer';
import { Attachment, AttachmentSchema } from './attachment.schema';
import { User } from 'src/users/schemas/user.schema';

export type MessageDocument = Message & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
})
export class Message {
  constructor(partial: Partial<Message>) {
    Object.assign(this, partial);
  }

  @Exclude()
  _id?: string;

  @Type(() => Attachment)
  @Prop({ type: [AttachmentSchema], default: [] })
  attachments: Attachment[];

  @Exclude()
  @Prop({
    type: String,
  })
  authorId: string;

  @Type(() => User)
  author: User;

  @Prop()
  channelId: string;

  @Prop()
  content: string;

  @Prop()
  mentionEveryone: boolean;

  @Prop({ type: [], default: [] })
  mentionRoles: string[];

  @Exclude()
  @Type(() => User)
  @Prop([{ type: String }])
  mentionIds: string[];

  @Type(() => User)
  mentions: User[];

  @Prop({ required: true })
  nonce: string;

  @Prop()
  referenced_message?: string;

  @Exclude()
  createdAt: string;

  @Exclude()
  updatedAt: string;

  @Exclude()
  __v: number;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.virtual('author', {
  ref: User.name,
  localField: 'authorId',
  foreignField: 'userId',
  justOne: true,
});

MessageSchema.virtual('mentions', {
  ref: User.name,
  localField: 'mentionIds',
  foreignField: 'userId',
});
