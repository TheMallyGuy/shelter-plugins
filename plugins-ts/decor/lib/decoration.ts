import type { Decoration } from "./api";
import { CDN_URL } from "./constants";

export const decorationToAsset = (d: Decoration) => `${d.animated ? "a_" : ""}${d.hash}`;

export const decorUrl = (asset: string) => `${CDN_URL}/${asset}.png`;
