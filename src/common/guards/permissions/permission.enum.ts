export enum Permission {
  // messages
  SEND_MESSAGES = 'send_messages',
  DELETE_MESSAGES = 'delete_messages',
  VIEW_MESSAGES = 'view_messages',
  SEND_ATTACHMENTS = 'send_attachments',

  // channels
  VIEW_CHANNELS = 'view_channels',
  MANAGE_CHANNELS = 'manage_channels',
}

export enum RoutingKeys {
  SERVER_CREATE = 'server.create',
  SERVER_UPDATE = 'server.update',
  SERVER_DELETE = 'server.delete',
  ROLE_CREATE = 'server.role.create',
  ROLE_UPDATE = 'server.role.update',
  ROLE_DELETE = 'server.role.delete',
  MEMBER_CREATE = 'server.member.create',
  MEMBER_UPDATE = 'server.member.update',
  MEMBER_DELETE = 'server.member.delete',
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
}
