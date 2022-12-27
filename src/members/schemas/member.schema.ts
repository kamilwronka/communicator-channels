import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';

export type MemberDocument = HydratedDocument<Member>;

@Schema({
  timestamps: true,
  optimisticConcurrency: true,
  versionKey: 'version',
  toJSON: { virtuals: true },
})
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

  @Exclude()
  version: number;

  @Exclude()
  @Prop({ type: String, required: true, trim: true, unique: true })
  versionHash: string;
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
