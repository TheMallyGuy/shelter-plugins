// improved version of https://github.com/SpikeHD/shelter-plugins/blob/main/plugins/always-trust/index.ts
const {
    flux: { storesFlat },
    patcher,
    observeDom,
    ui: { injectCss }
} = shelter;

const DANGEROUS_DOWNLOAD = '[role="dialog"][aria-label="Potential Dangerous Download"]';

const disposers: (() => void)[] = [];

export function onLoad() {
    disposers.push(patcher.instead("isTrustedDomain", storesFlat.MaskedLinkStore, () => true));
    disposers.push(injectCss(`[class*="layer_"]:has(> ${DANGEROUS_DOWNLOAD}) { display: none !important; }`));
    const handled = new WeakSet<Element>();

    disposers.push(
        observeDom(DANGEROUS_DOWNLOAD, (dialog) => {
            if (handled.has(dialog)) return;
            const btn = dialog.querySelector<HTMLButtonElement>("footer button:last-child");
            if (!btn) return;
            handled.add(dialog);
            btn.click();
        })
    );
}

export function onUnload() {
    for (const d of disposers.splice(0)) d();
}
