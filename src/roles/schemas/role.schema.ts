import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({
  timestamps: true,
  optimisticConcurrency: true,
  versionKey: 'version',
  toJSON: { virtuals: true },
})
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

  @Exclude()
  version: number;

  @Exclude()
  @Prop({ type: String, required: true, trim: true, unique: true })
  versionHash: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
