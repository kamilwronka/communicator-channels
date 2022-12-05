import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class User {
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
  __v: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('id').get(function () {
  return this.userId;
});
