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
  mimeType: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);