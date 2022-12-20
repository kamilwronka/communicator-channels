import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';

export type MemberDocument = HydratedDocument<Member>;

@Schema({ timestamps: true, versionKey: false, toJSON: { virtuals: true } })
export class Member {
  _id: string;

  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: false,
    trim: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
    immutable: true,
    unique: false,
    trim: true,
  })
  serverId: string;

  @Prop([{ type: String }])
  roleIds: string[];

  roles: Role[];

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

MemberSchema.virtual('roles', {
  ref: Role.name,
  localField: 'roleIds',
  foreignField: 'roleId',
});
