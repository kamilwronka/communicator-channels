import { lookup } from 'mime-types';
import { MessageAttachment } from '../dto/send-message.dto';
import { Attachment } from '../schemas/attachment.schema';

export const createMessageAttachments = (
  attachments: MessageAttachment[],
  cdnUrl: string,
): Attachment[] => {
  const mappedAttachments: Attachment[] = [];

  attachments.forEach((attachment) => {
    const mimeType = lookup(attachment.key);

    if (mimeType) {
      mappedAttachments.push({
        url: `https://${cdnUrl}/${attachment.key}`,
        mimeType,
      });
    }
  });

  return mappedAttachments;
};
