const {
    observeDom,
    ui: { injectCss }
} = shelter;

const PIN_DIALOG = '[data-dialog="modal"][aria-label="Pin It. Pin It Good."]';

const disposers: (() => void)[] = [];

export function onLoad() {
    disposers.push(injectCss(`[class*="layer_"]:has(> ${PIN_DIALOG}) { display: none !important; }`));
    const handled = new WeakSet<Element>();

    disposers.push(
        observeDom(PIN_DIALOG, (dialog) => {
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
