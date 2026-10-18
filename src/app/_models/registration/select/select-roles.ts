import {Select} from "./select";
import {AccessRole} from "../../user/access-role";

export const select_roles: Select[] = [
  new Select(AccessRole.ADMIN_PAGE_ACCESS, 'roles.adminPageAccess'),
  new Select(AccessRole.ADMIN_CORE_SETTINGS, 'roles.adminCoreSettings')
];
