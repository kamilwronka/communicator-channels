import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true, versionKey: false, toJSON: { virtuals: true } })
export class Role {
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
