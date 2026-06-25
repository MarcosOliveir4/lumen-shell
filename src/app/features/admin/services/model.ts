export interface IUsers {
  data: IUser[];
  hasNext: boolean;
  nextPageToken?: string;
}

export interface IUser {
  uid: string;
  email: string;
  displayName: string;
  roles: string[];
}
