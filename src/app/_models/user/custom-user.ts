import {AccessRole} from "./access-role";

export interface CustomUser {
  readonly id: string;
  readonly uid: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly roles: ReadonlyArray<AccessRole>;
  readonly photoUrl?: string;
  readonly isDeleted?: boolean;
}
