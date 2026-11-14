import { getUsersDecorations } from "./api";
import { BATCH_SIZE, MARKER } from "./constants";

const {
  flux: { storesFlat },
  util: { log },
} = shelter;

export const UserStore = () => storesFlat.UserStore as any;

/** userId to decor asset (null = none / pending) */
export const cache = new Map<string, string | null>();
/** user object to Discord's original avatarDecorationData */
export const originals = new Map<any, any>();

const queue = new Set<string>();
let timer: ReturnType<typeof setTimeout> | undefined;

function request(id: string) {
  if (cache.has(id)) return;
  cache.set(id, null);
  queue.add(id);
  timer ??= setTimeout(flush, 100);
}

async function flush() {
  const ids = [...queue];
  queue.clear();
  timer = undefined;

  let changed = false;
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const chunk = ids.slice(i, i + BATCH_SIZE);
    try {
      const res = await getUsersDecorations(chunk);
      for (const id of chunk) {
        if (res[id]) {
          cache.set(id, res[id]);
          changed = true;
        }
      }
    } catch (e) {
      log(`fetch failed ${e}`, "error");
    }
  }
  if (changed) UserStore().emitChange();
}

export function applyDecor(user: any) {
  if (!user?.id) return;
  request(user.id);
  const asset = cache.get(user.id);

  if (!asset) {
    // decor removed so we give them back
    if (originals.has(user)) {
      user.avatarDecorationData = originals.get(user);
      originals.delete(user);
    }
    return;
  }
  if (!originals.has(user)) originals.set(user, user.avatarDecorationData);

  user.avatarDecorationData = { asset: MARKER + asset, skuId: MARKER + asset };
}

export function resetUsers() {
  for (const [user, data] of originals) user.avatarDecorationData = data;
  originals.clear();
  clearTimeout(timer);
  timer = undefined;
  queue.clear();
  cache.clear();
}
