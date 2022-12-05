import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Exclude, Transform, Type } from 'class-transformer';
import { Attachment, AttachmentSchema } from './attachment.schema';
import { User } from 'src/users/schemas/user.schema';

export type MessageDocument = Message & Document;

@Schema({
  timestamps: true,
})
export class Message {
  constructor(partial: Partial<Message>) {
    Object.assign(this, partial);
  }

  @Transform((value) => value.obj._id.toString())
  _id?: string;

  @Type(() => Attachment)
  @Prop({ type: [AttachmentSchema], default: [] })
  attachments: Attachment[];

  @Type(() => User)
  @Prop({ type: String, ref: User.name })
  author: User | string;

  @Prop()
  channelId: string;

  @Prop()
  content: string;

  @Prop()
  mentionEveryone: boolean;

  @Prop({ type: [], default: [] })
  mentionRoles: string[];

  @Type(() => User)
  @Prop([{ type: String, ref: User.name }])
  mentions: User[] | string[];

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
