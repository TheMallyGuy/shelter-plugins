import { type Decoration, getPresets, getUserDecorations, setUserDecoration } from "../lib/api";
import { decorationToAsset, decorUrl } from "../lib/decoration";

const {
  ui: { openModal, ModalRoot, ModalHeader, ModalBody, ModalSizes, Header, HeaderTags, Text, showToast },
  solid: { createResource, createSignal, For, Show },
  plugin: { store },
} = shelter;

const tile = (selected: boolean) =>
  `width:80px;height:80px;border-radius:8px;cursor:pointer;display:grid;place-items:center;` +
  `background:var(--background-mod-normal, rgba(0,0,0,.2));` +
  `outline:2px solid ${selected ? "var(--brand-500, #5865f2)" : "transparent"};`;

/** onPick gets the new asset (null = removed) after the Decor API accepted it */
export function openDecorPicker(current: string | null, onPick: (asset: string | null) => void) {
  openModal(({ close }) => {
    const [presets] = createResource(getPresets);
    // ponytail: needs a Decor token in store.token; login flow not built yet
    const [mine] = createResource(() => (store.token ? getUserDecorations() : Promise.resolve([] as Decoration[])));
    const [busy, setBusy] = createSignal(false);

    async function pick(d: Decoration | null) {
      if (busy()) return;
      if (!store.token) {
        showToast({ title: "Decor", content: "Not logged in to Decor yet" });
        return;
      }
      setBusy(true);
      try {
        await setUserDecoration(d);
        onPick(d && decorationToAsset(d));
        close();
      } catch (e) {
        showToast({ title: "Decor", content: `Failed to set decoration: ${e}` });
      } finally {
        setBusy(false);
      }
    }

    const Grid = (props: { items: Decoration[] }) => (
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 16px">
        <For each={props.items}>
          {(d) => (
            <div
              style={tile(current === decorationToAsset(d))}
              title={d.alt ?? ""}
              onClick={() => pick(d)}
            >
              <img src={decorUrl(decorationToAsset(d))} style="width:72px;height:72px" />
            </div>
          )}
        </For>
      </div>
    );

    return (
      <ModalRoot size={ModalSizes.MEDIUM}>
        <ModalHeader close={close}>Change Decor decoration</ModalHeader>
        <ModalBody>
          <div style={tile(current === null)} onClick={() => pick(null)}>
            <Text>None</Text>
          </div>

          <Show when={store.token}>
            <Header tag={HeaderTags.H3}>Your decorations</Header>
            <Grid items={mine() ?? []} />
          </Show>

          <Show when={presets()} fallback={<Text>Loading presets…</Text>}>
            <For each={presets()}>
              {(p) => (
                <>
                  <Header tag={HeaderTags.H3}>{p.name}</Header>
                  <Show when={p.description}><Text>{p.description}</Text></Show>
                  <Grid items={p.decorations} />
                </>
              )}
            </For>
          </Show>
        </ModalBody>
      </ModalRoot>
    );
  });
}
