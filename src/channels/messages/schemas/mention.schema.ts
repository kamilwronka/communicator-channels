import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MentionDocument = Mention & Document;
@Schema({ _id: false })
export class Mention {
  @Prop()
  id: string;

  @Prop()
  username: string;

  @Prop()
  profile_picture_url: string;
}

export const MentionSchema = SchemaFactory.createForClass(Mention);
