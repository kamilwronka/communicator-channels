import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Type } from 'class-transformer';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

import { EChannelType } from '../enums/channel-type.enum';
import {
  PermissionOverwrite,
  PermissionOverwriteSchema,
} from './permission-overwrite.schema';

export type ChannelDocument = Channel & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Channel {
  constructor(partial: Partial<Channel>) {
    Object.assign(this, partial);
  }

  @Exclude()
  _id?: string;

  @Prop({ required: false, default: undefined })
  name: string;

  @Prop({ required: false, default: undefined })
  serverId?: string;

  @Prop({ required: false })
  parentId?: string;

  @Prop()
  type: EChannelType;

  @Exclude()
  @Prop([{ type: String }])
  userIds?: string[];

  @Type(() => User)
  users?: User[];

  @Type(() => PermissionOverwrite)
  @Prop({ type: [PermissionOverwriteSchema], default: [] })
  permissionsOverwrites?: PermissionOverwrite[];

  @Prop()
  lastMessageDate?: string;

  @Exclude()
  __v: number;

  @Exclude()
  createdAt: string;

  @Exclude()
  updatedAt: string;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);

ChannelSchema.virtual('users', {
  ref: User.name,
  localField: 'userIds',
  foreignField: 'userId',
});
