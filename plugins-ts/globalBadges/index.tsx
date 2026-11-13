import { loadBadges } from "./api";

const { http: { intercept }, plugin: { store }, observeDom, ui: { injectCss }, util: { log } } = shelter;

type CustomBadge = {
    id: string;
    badgeId: number;
    name: string;
    label: string;
    description: string;
    icon: string;
    link?: string;
};

const iconUrl = (icon: string) => (icon.startsWith("http") ? icon : `https://cdn.discordapp.com/badge-icons/${icon}.png`);

const toProfileBadge = (b: CustomBadge) => ({
    id: b.id,
    description: b.label,
    icon: b.icon,
    link: b.link
});

const toModalBadge = (b: CustomBadge) => ({
    badge_id: b.badgeId,
    name: b.name,
    description: b.description,
    info_label: b.label,
    rarity: 1,
    simple_icon_url: iconUrl(b.icon),
    simple_icon_raster_url: iconUrl(b.icon),
    is_earnable: false,
    owned: true,
    progress: null
});

const disposers: (() => void)[] = [];

export function onLoad() {
    if (!store.apiUrl) {
        store.apiUrl = "https://badges.equicord.org/"
    }

    let globalBadges: Awaited<ReturnType<typeof loadBadges>> = {};

    loadBadges()
        .then((b) => {
            globalBadges = b;
            log(`loaded badges for ${Object.keys(b).length} users`);
        })
        .catch((e) => log(`failed to load: ${e} (${store.apiUrl})`, "error"));

    const fromApi = (b: (typeof globalBadges)[string][number], i: number): CustomBadge => ({
        id: `global_${b.mod}_${i}`,
        badgeId: 900100 + i,
        name: b.tooltip,
        label: b.tooltip,
        description: `Badge from ${b.mod}!`,
        icon: b.badge
    });

    const badgesFor = (url: string) => {
        const userId = url.match(/\/users\/(\d+)/)?.[1] ?? "";
        return (globalBadges[userId] ?? []).map(fromApi);
    };

    disposers.push(
        injectCss(`
            .shelter-global-badge {
               border-radius: 50%; transform: scale(0.9);
            }
        `)
    );

    disposers.push(
        observeDom('img[src*="badge-icons/http"]', (img) => {
            const src = img.getAttribute("src")!;
            img.setAttribute("src", src.slice(src.indexOf("badge-icons/") + "badge-icons/".length).replace(/\.png$/, ""));
        })
    );

    disposers.push(
        observeDom('div[aria-label="User Badges"] > a[role="link"]', (anchor) => {
            if (anchor.dataset.customProcessed) return;
            anchor.dataset.customProcessed = "true";

            const img = anchor.querySelector('img');
            if (!img) return;

            const src = img.getAttribute("src") || "";

            if (!src.includes("cdn.discordapp.com")) { // ingores discord default cdn
                img.classList.add("shelter-global-badge");
            }
        })
    );

    disposers.push(
        intercept("get", /\/users\/\d+\/profile/, async (req, send) => {
            const res = await send(req);
            if (res.ok && res.body) {
                res.body.badges = [...badgesFor(req.url).map(toProfileBadge), ...(res.body.badges ?? [])];
            }
            return res;
        })
    );

    disposers.push(
        intercept("get", /\/users\/\d+\/badges/, async (req, send) => {
            const res = await send(req);
            if (res.ok && res.body) {
                res.body.badges = [...badgesFor(req.url).map(toModalBadge), ...(res.body.badges ?? [])];
            }
            return res;
        })
    );
}

export function onUnload() {
    for (const d of disposers.splice(0)) d();
}
