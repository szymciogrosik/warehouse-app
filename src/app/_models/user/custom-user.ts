import {AccessRole} from "./access-role";

export class CustomUser {
  id: string;
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: AccessRole[];
}
