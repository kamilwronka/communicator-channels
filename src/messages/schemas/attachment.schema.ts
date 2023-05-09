import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document } from 'mongoose';

export type AttachmentDocument = Attachment & Document;
@Schema({ toJSON: { virtuals: true } })
export class Attachment {
  @Exclude()
  _id?: string;

  @Prop()
  url: string;

  @Prop()
  mimeType: string;

  @Prop()
  fileSize: number;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
