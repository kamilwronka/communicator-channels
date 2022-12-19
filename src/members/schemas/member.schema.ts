import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export type MemberDocument = HydratedDocument<Member>;

@Schema({ timestamps: true, versionKey: false })
export class Member {
  @Exclude()
  _id: string;

  @Exclude()
  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: false,
    trim: true,
  })
  userId: string;

  @Exclude()
  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: false,
    trim: true,
  })
  serverId: string;

  @Prop([{ type: String }])
  roles: string[];

  createdAt: number;
  updatedAt: number;

  @Prop({ type: Number })
  version: number;
}

export const MemberSchema = SchemaFactory.createForClass(Member);

MemberSchema.index(
  { userId: 1, serverId: 1 },
  { unique: true, name: 'userId_serverId' },
);
