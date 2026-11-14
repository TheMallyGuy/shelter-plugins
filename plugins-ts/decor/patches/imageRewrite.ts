import { MARKER } from "../lib/constants";
import { decorUrl } from "../lib/decoration";
import { originals, UserStore } from "../lib/users";

const { observeDom } = shelter;

const isDiscordDecorTile = (el: Element) =>
  !el.closest("[data-decor]") &&
  !!el
    .closest("fieldset")
    ?.querySelector('[aria-label="Change Avatar Decoration"]');

export const patchImages = () =>
  observeDom(`img[src*="${MARKER}"]`, (el) => {
    const img = el as HTMLImageElement;

    if (isDiscordDecorTile(img)) {
      const original = originals.get(UserStore().getCurrentUser())?.asset;
      if (original)
        img.src = `https://cdn.discordapp.com/avatar-decoration-presets/${original}.png?size=96&passthrough=true`;
      else if (img.style.display !== "none") img.style.display = "none";
      return;
    }

    const m = img.src.match(new RegExp(`${MARKER}(a_)?([0-9a-f]+)`));
    if (!m) return;
    const animate = m[1] && !/\/static|passthrough=false/.test(img.src);

    img.src = decorUrl(`${animate ? "a_" : ""}${m[2]}`);
  });
