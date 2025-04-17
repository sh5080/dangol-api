export interface CheckEmailDto {
  email: string;
}

export interface GetChatParticipantsDto {
  userIds: string[];
}

export interface FindEmailDto {
  name: string;
  phoneNumber: string;
}
