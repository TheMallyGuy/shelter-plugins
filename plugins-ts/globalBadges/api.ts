// https://github.com/Equicord/Equicord/blob/main/src/equicordplugins/globalBadges/utils.ts

const { plugin: { store } } = shelter;

type ApiBadge = { mod: string; tooltip: string; badge: string; [key: string]: unknown };
type GlobalBadge = ApiBadge & { key: string };

export let GlobalBadges: Record<string, GlobalBadge[]> = {};
export const serviceMap: Record<string, string> = {
    badgevault: "BadgeVault",
    nekocord: "Nekocord",
    reviewdb: "ReviewDB",
    aero: "Aero",
    aliucord: "Aliucord",
    raincord: "Raincord",
    velocity: "Velocity",
    enmity: "Enmity",
    paicord: "Paicord",
    bunny: "Bunny",
    goosemod: "GooseMod",
    replugged: "Replugged",
    betterdiscord: "BetterDiscord",
    vendroidenhanced: "VendroidEnhanced",
    revenge: "Revenge",
    record: "ReCord",
    vencord: "Vencord",
    equicord: "Equicord"
};

const blockedMods = ["vencord", "equicord"];

export async function loadBadges() {
    const url = store.apiUrl.endsWith("/") ? store.apiUrl + "users" : store.apiUrl + "/users";
    const globalBadges: { users: Record<string, ApiBadge[]> } = await fetch(url, { cache: "no-cache" }).then(r => r.json());
    const filteredUsers: Record<string, GlobalBadge[]> = {};

    for (const key in globalBadges.users) {
        filteredUsers[key] = globalBadges.users[key].filter(b => {
            const { mod } = b;
            if (!mod || blockedMods.includes(mod)) return false;

            const conditionalMods: Record<string, boolean> = {
                aero: store.showAero,
                velocity: store.showVelocity,
                badgevault: store.showCustom,
                nekocord: store.showNekocord,
                reviewdb: store.showReviewDB,
                aliucord: store.showAliucord,
                raincord: store.showRaincord,
                enmity: store.showEnmity,
                paicord: store.showPaicord,
                bunny: store.showBunny,
                goosemod: store.showGooseMod,
                replugged: store.showReplugged,
                betterdiscord: store.showBetterDiscord,
                vendroidenhanced: store.showVendroidEnhanced,
                revenge: store.showRevenge,
                record: store.showReCord
            };

            // unset settings (undefined) count as shown; only an explicit false hides a mod
            if (conditionalMods[mod] === false) return false;

            return true;
        }).map(b => {
            const modFormatted = serviceMap[b.mod];
            const prefix = store.showModStyle === "prefix" ? `${modFormatted} - ` : "";
            const suffix = store.showModStyle === "suffix" ? ` - ${modFormatted}` : "";

            const tooltip = prefix + b.tooltip + suffix;
            return {
                ...b,
                key: b.tooltip,
                tooltip
            };
        });
    }

    GlobalBadges = filteredUsers;
    return filteredUsers;
}