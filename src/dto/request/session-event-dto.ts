export class SessionEventDTO {
  sessionEvent!: string;
  sessionActiveTime!: Date;

  constructor(sessionEvent: string, sessionActiveTime: Date) {
    this.sessionEvent = sessionEvent;
    this.sessionActiveTime = sessionActiveTime;
  }
}
