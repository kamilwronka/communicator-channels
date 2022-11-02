import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import { Attachment, AttachmentSchema } from './attachment.schema';
import { User, UserSchema } from './user.schema';

export type MessageDocument = Message & Document;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Message {
  constructor(partial: Partial<Message>) {
    Object.assign(this, partial);
  }

  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id?: string;

  @Type(() => Attachment)
  @Prop({ type: [AttachmentSchema], default: [] })
  attachments: Attachment[];

  @Type(() => User)
  @Prop({ type: UserSchema })
  author: User;

  @Prop()
  channel_id: string;

  @Prop()
  content: string;

  @Prop()
  mention_everyone: boolean;

  @Prop({ type: [], default: [] })
  mention_roles: string[];

  @Type(() => User)
  @Prop({ type: [UserSchema], default: [] })
  mentions: User[];

  @Prop({ required: true })
  nonce: string;

  @Prop()
  referenced_message?: string;

  created_at?: string;
  updated_at?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
