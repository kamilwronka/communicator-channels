import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform, Type } from 'class-transformer';
import { Document } from 'mongoose';
import { User } from '../dto/create-channel.dto';

import { EChannelType } from '../enums/channel-type.enum';
import {
  PermissionOverwrite,
  PermissionOverwriteSchema,
} from './permission-overwrite.schema';

export type ChannelDocument = Channel & Document;

@Schema({ timestamps: true })
export class Channel {
  @Transform(
    ({ value }) => {
      return value.toString();
    },
    { toPlainOnly: true },
  )
  _id?: string;

  @Prop({ required: false, default: undefined })
  name: string;

  @Prop({ required: false, default: undefined })
  serverId?: string;

  @Prop({ required: false })
  parentId?: string;

  @Prop()
  type: EChannelType;

  @Prop({ type: [], default: undefined })
  users?: User[];

  @Type(() => PermissionOverwrite)
  @Prop({ type: [PermissionOverwriteSchema], default: [] })
  permissionsOverwrites?: PermissionOverwrite[];

  @Prop()
  lastMessageDate?: string;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
