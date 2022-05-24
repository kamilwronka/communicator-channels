import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document } from 'mongoose';

export type AttachmentDocument = Attachment & Document;
@Schema()
export class Attachment {
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id?: string;

  @Prop()
  url: string;

  @Prop()
  content_type: string;

  @Prop()
  filename: string;

  @Prop()
  size: number;

  @Prop()
  height: number;

  @Prop()
  width: number;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
