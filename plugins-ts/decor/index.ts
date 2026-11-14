import { applyDecor, resetUsers, UserStore } from "./lib/users";
import { patchImages } from "./patches/imageRewrite";
import { patchProfileSection } from "./patches/profileSection";

const { patcher } = shelter;

const disposers: (() => void)[] = [];

export function onLoad() {
  disposers.push(
    patcher.after("getUser", UserStore(), (_args, user) => applyDecor(user)),
    patcher.after("getCurrentUser", UserStore(), (_args, user) => applyDecor(user)),
    patchImages(),
    patchProfileSection(),
  );
  UserStore().emitChange();
}

export function onUnload() {
  for (const d of disposers.splice(0)) d();
  document.querySelectorAll("[data-decor]").forEach((el) => el.remove());
  resetUsers();
  UserStore().emitChange();
}
