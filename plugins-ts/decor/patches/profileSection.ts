import { authorize } from "../lib/auth";
import { decorUrl } from "../lib/decoration";
import { cache, UserStore } from "../lib/users";
import { openDecorPicker } from "../ui/picker";

const {
  observeDom,
  plugin: { store },
} = shelter;

const TILE_SEL = '[aria-label="Change Avatar Decoration"]'; // english-only, localized clients won't match

function setTileImage(group: HTMLElement, asset: string | null) {
  const img = group.querySelector<HTMLImageElement>(
    'img[class*="avatarDecoration_"]',
  );
  if (!img) return;
  if (asset) img.src = decorUrl(asset);

  img.style.display = asset ? "" : "none";
}

async function onTileClick(group: HTMLElement) {
  if (!store.token && !(await authorize())) return;

  const me = UserStore().getCurrentUser();

  openDecorPicker(cache.get(me.id) ?? null, (asset) => {
    cache.set(me.id, asset);
    setTileImage(group, asset);
    UserStore().emitChange();
  });
}

export const patchProfileSection = () =>
  observeDom(TILE_SEL, (el) => {
    const group = el.closest('[class*="group_"]');
    if (!group || group.nextElementSibling?.hasAttribute("data-decor")) return; // guard: only once

    const decorGroup = group.cloneNode(true) as HTMLElement;
    decorGroup.dataset.decor = "";
    decorGroup.querySelector("h3")!.textContent = "Decor";

    // keep only the decoration tile
    decorGroup.querySelectorAll("fieldset").forEach((f) => {
      if (!f.querySelector(TILE_SEL)) f.remove();
    });
    decorGroup.querySelector('[class*="deleteButtonWrapper_"]')?.remove();

    const button = decorGroup.querySelector<HTMLElement>(
      '[class*="tileButton_"]',
    )!;
    button.ariaLabel = "Change Decor decoration"; // also stops this observer matching the clone
    button.onclick = () => onTileClick(decorGroup);

    group.after(decorGroup);

    // clone may have copied the Discord decoration (or a hidden img): point it at the decor asset
    const asset = cache.get(UserStore().getCurrentUser()?.id);

    if (asset) setTileImage(decorGroup, asset);
  });
