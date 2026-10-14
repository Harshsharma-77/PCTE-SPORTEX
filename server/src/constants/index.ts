export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SPORTS_ADMIN: 'SPORTS_ADMIN',
  COACH: 'COACH',
  STUDENT: 'STUDENT',
  REFEREE: 'REFEREE',
  VIEWER: 'VIEWER',
} as const;

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_MATCH: 'join:match',
  LEAVE_MATCH: 'leave:match',
  JOIN_TOURNAMENT: 'join:tournament',
  LEAVE_TOURNAMENT: 'leave:tournament',
  SCORE_UPDATE: 'score:update',
  EVENT_TRIGGERED: 'event:triggered',
  EVENT_UNDONE: 'event:undone',
  MATCH_STATUS_CHANGE: 'match:status_change',
  POINTS_TABLE_UPDATE: 'points:update',
  ANNOUNCEMENT_NEW: 'announcement:new',
  NOTIFICATION_NEW: 'notification:new',
} as const;
