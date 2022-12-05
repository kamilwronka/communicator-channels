import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, _id: false })
export class User {
  @Prop({ type: String, index: true, unique: true, required: true })
  _id: string;

  @Prop({ type: String, unique: true, required: true })
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
