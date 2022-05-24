export const parseMessageContent = (content: string) => {
  //   const match = /(?<=<).*?(?=>)/gs.exec(content);
  const match = content.match(
    /(?<=<@)(here|([a-f\d]{24})|(&[a-f\d]{24}))(?=>)/gis,
  );

  let mentionEveryone = false;
  const mentionRoles: string[] = [];
  const mentions: string[] = [];

  match &&
    match.forEach((value) => {
      if (value.includes('here')) {
        mentionEveryone = true;

        return;
      }

      if (value.includes('&')) {
        mentionRoles.push(value.replace('&', ''));

        return;
      } else {
        mentions.push(value);
        return;
      }
    });

  return {
    content,
    mentionEveryone,
    mentionRoles,
    mentions,
  };
};
