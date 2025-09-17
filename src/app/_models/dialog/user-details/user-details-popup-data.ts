import {CustomUser} from "../../user/custom-user";
import {UserDetailsType} from "./user-details-type";

export class UserDetailsPopupData {
  user: CustomUser;
  userDetailsType: UserDetailsType;

  constructor(
    user: CustomUser,
    userDetailsType: UserDetailsType,
  ) {
    this.user = user;
    this.userDetailsType = userDetailsType;
  }
}
