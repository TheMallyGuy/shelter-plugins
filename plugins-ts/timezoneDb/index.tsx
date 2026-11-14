import { deleteTimezone, getTimezone, loadDatabaseTimezones, setTimezone, setUserDatabaseTimezone } from "./api";

const {
  observeDom,
  flux: { storesFlat },
  plugin: { store },
  solid: { createSignal },
  ui: { injectCss, Header, HeaderTags, TextBox, Button, ButtonColors, Divider, Space },
  util: { getFiber, reactFiberWalker, log },
} = shelter;

const SPAN = "timezone-db-profile-span";
const disposers: (() => void)[] = [];

const fmt = (zone: string) =>
  new Intl.DateTimeFormat(undefined, { timeZone: zone, hour: "2-digit", minute: "2-digit" });

const offsetHours = (zone: string, now = new Date()) => {
  const at = (z?: string) => new Date(now.toLocaleString("en-US", { timeZone: z })).getTime();
  return Math.round((at(zone) - at()) / 36e5);
};

const text = (zone: string) => {
  const diff = offsetHours(zone);
  const rel = diff === 0 ? "same time" : `${diff > 0 ? "+" : ""}${diff}h`;
  return `${fmt(zone).format(new Date())} (${rel})`;
};

const idOf = (p: any): string | undefined => p?.user?.id ?? p?.userId;

const userIdOf = (el: Element) =>
  idOf(reactFiberWalker(getFiber(el), (f) => !!idOf(f.pendingProps), true)?.pendingProps);

const localZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const myId = (): string | undefined => storesFlat.UserStore?.getCurrentUser?.()?.id;

export const settings = () => {
  const [zone, setZone] = createSignal(store.myTimezone ?? localZone());
  const [busy, setBusy] = createSignal(false);

  const run = async (fn: () => Promise<boolean>, zoneAfter: string | null) => {
    setBusy(true);
    try {
      if (await fn()) {
        store.myTimezone = zoneAfter ?? undefined;
        const id = myId();
        if (id) setUserDatabaseTimezone(id, zoneAfter);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header tag={HeaderTags.H5}>Database URL</Header>
      <TextBox
        value={store.databaseUrl ?? ""}
        placeholder="https://timezone.creations.works"
        onInput={(v) => (store.databaseUrl = v || undefined)}
      />
      <Space />
      <Header tag={HeaderTags.H5}>Your timezone (IANA, e.g. Europe/Berlin)</Header>
      <TextBox value={zone()} list="timezone-db-zones" onInput={setZone} />
      <datalist id="timezone-db-zones">
        {Intl.supportedValuesOf("timeZone").map((z) => <option value={z} />)}
      </datalist>
      <Space />
      <div style={{ display: "flex", gap: "8px" }}>
        <Button grow disabled={busy()} onClick={() => run(() => setTimezone(zone()), zone())}>Save</Button>
        <Button grow disabled={busy()} color={ButtonColors.RED} onClick={() => run(deleteTimezone, null)}>Delete</Button>
        <Button grow disabled={busy()} color={ButtonColors.SECONDARY} onClick={() => loadDatabaseTimezones()}>Refresh</Button>
      </div>
      <Divider mt mb />
    </>
  );
};

export function onLoad() {
  loadDatabaseTimezones().then((ok) => log(ok ? "timezones loaded" : "timezone list fetch failed", ok ? "log" : "warn"));

  disposers.push(injectCss(`
.${SPAN} {
  position: absolute;
  right: 0;
  bottom: 0;
  margin: 28px 16px 4px;
  background-color: #0000007f;
  border-radius: 4px;
  padding: .25rem .5rem;
  font-size: .75rem;
  color: var(--text-default);
}
`));

  disposers.push(
    observeDom('[class*="banner_"]', (el) => {
      if (el.dataset.timezoneDb) return;
      el.dataset.timezoneDb = "true";

      const userId = userIdOf(el);
      const zone = userId && getTimezone(userId);
      if (!zone) return;

      const span = document.createElement("span");
      span.className = SPAN;
      span.dataset.zone = zone;
      span.textContent = text(zone);
      el.appendChild(span);
    })
  );

  const tick = setInterval(() => {
    for (const s of document.querySelectorAll<HTMLElement>(`.${SPAN}`)) s.textContent = text(s.dataset.zone!);
  }, 10_000);
  disposers.push(() => clearInterval(tick));
}

export function onUnload() {
  for (const d of disposers.splice(0)) d();
}
