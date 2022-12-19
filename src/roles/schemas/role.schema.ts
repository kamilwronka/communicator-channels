import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true, versionKey: false })
export class Role {
  @Exclude()
  _id: string;

  @Prop({
    type: String,
    index: true,
    unique: true,
    required: true,
    trim: true,
    immutable: true,
  })
  roleId: string;

  @Prop([{ type: String }])
  permissions: string[];

  createdAt: number;
  updatedAt: number;

  @Prop({ type: Number })
  version: number;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
