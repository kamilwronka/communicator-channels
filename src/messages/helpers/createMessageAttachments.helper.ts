import { lookup } from 'mime-types';
import { MessageAttachment } from '../dto/send-message.dto';
import { Attachment } from '../schemas/attachment.schema';

export const createMessageAttachments = (
  attachments: MessageAttachment[],
): Attachment[] => {
  const mappedAttachments: Attachment[] = [];

  attachments.forEach((attachment) => {
    const mimeType = lookup(attachment.key);

    if (mimeType) {
      mappedAttachments.push({
        url: `${attachment.key}`,
        mimeType,
        fileSize: attachment.fileSize,
      });
    }
  });

  return mappedAttachments;
};
