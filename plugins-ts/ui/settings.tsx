import type { JSX } from "solid-js";

const {
  plugin: { store },
  ui: {
    Header,
    HeaderTags,
    Text,
    TextTags,
    TextBox,
    SwitchItem,
    SelectItem,
    SelectOption,
    Space,
  },
} = shelter;

type Base = { key: string; label: JSX.Element; note?: JSX.Element };

export const Setting = (p: {
  label: JSX.Element;
  note?: JSX.Element;
  children: JSX.Element;
}) => (
  <>
    <Header tag={HeaderTags.H5}>{p.label}</Header>
    {p.note && (
      <Text
        tag={TextTags.textSM}
        style={{
          display: "block",
          "margin-bottom": "8px",
          color: "var(--text-muted)",
        }}
      >
        {p.note}
      </Text>
    )}
    {p.children}
    <Space />
  </>
);

export const TextSetting = (
  p: Base & { placeholder?: string; suggestions?: string[]; fallback?: string },
) => {
  const listId = p.suggestions && `shelter-ts-${p.key}`;
  return (
    <Setting label={p.label} note={p.note}>
      <TextBox
        value={store[p.key] ?? p.fallback ?? ""}
        placeholder={p.placeholder}
        list={listId}
        onInput={(v) => (store[p.key] = v || undefined)}
      />
      {listId && (
        <datalist id={listId}>
          {p.suggestions!.map((s) => (
            <option value={s} />
          ))}
        </datalist>
      )}
    </Setting>
  );
};

export const SwitchSetting = (p: Base & { fallback?: boolean }) => (
  <SwitchItem
    note={p.note}
    checked={store[p.key] ?? p.fallback ?? false}
    onChange={(v) => (store[p.key] = v)}
  >
    {p.label}
  </SwitchItem>
);

type Opt = string | { value: string | number; label: JSX.Element };
export const SelectSetting = (
  p: Base & { options: Opt[]; fallback?: string | number },
) => (
  <SelectItem
    label={p.label}
    note={p.note}
    value={store[p.key] ?? p.fallback}
    onChange={(v) => (store[p.key] = v)}
  >
    {p.options.map((o) =>
      typeof o === "string" ? (
        <SelectOption value={o}>{o}</SelectOption>
      ) : (
        <SelectOption value={o.value}>{o.label}</SelectOption>
      ),
    )}
  </SelectItem>
);

export const ButtonRow = (p: { children: JSX.Element }) => (
  <div style={{ display: "flex", gap: "8px", "margin-bottom": "16px" }}>
    {p.children}
  </div>
);
