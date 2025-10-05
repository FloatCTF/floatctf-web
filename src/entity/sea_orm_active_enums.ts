export enum EventTeamMemberRole {
  Captain = 'captain',
  Member = 'member',
}

export enum EventType {
  JeopardySingle = 'jeopardy_single',
  JeopardyTeam = 'jeopardy_team',
  AwdTeam = 'awd_team',
}

export enum InstanceStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
}

export enum SettingValueType {
  String = 'string',
  Integer = 'integer',
  Boolean = 'boolean',
  Float = 'float',
}