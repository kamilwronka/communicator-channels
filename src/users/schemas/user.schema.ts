import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  versionKey: 'version',
  optimisticConcurrency: true,
})
export class User {
  id: string;

  @Exclude()
  _id: string;

  @Exclude()
  @Prop({ type: String, index: true, unique: true, required: true, trim: true })
  userId: string;

  @Prop({
    type: String,
    trim: true,
  })
  username: string;

  @Prop({ type: String, default: null })
  avatar: string;

  @Exclude()
  createdAt: number;

  @Exclude()
  updatedAt: number;

  @Exclude()
  version: number;

  @Exclude()
  @Prop({ type: String, required: true, trim: true, unique: true })
  versionHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('id').get(function () {
  return this.userId;
});
