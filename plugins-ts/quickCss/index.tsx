
const {
    ui: {
        Button,
        injectCss
    },
    plugin: { store },
    util: {
        log
    }
} = shelter

const MONACO = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs";

let editor: ReturnType<typeof openMonaco>;
let modifyCss: ((css?: string) => void) | undefined;

function openMonaco(
    initial = '/* ctrl + s to save */\n.test {\n    display: none \n}',
    onSave?: (code: string) => void
) {
    const win = window.open("", "QuickCss", "popup,width=600,height=400");
    if (!win) return log("Popup was blocked", "error");

    const code = JSON.stringify(initial).replace(/</g, "\\u003c");

    win.document.write(`<!doctype html>
<html>
<head>
  <title>Editor</title>
  <style>html, body, #c { margin: 0; height: 100%; overflow: hidden; }</style>
</head>
<body>
  <div id="c"></div>
  <script src="${MONACO}/loader.js"><\/script>
  <script>
    require.config({ paths: { vs: "${MONACO}" } });

    require(["vs/editor/editor.main"], () => {
      window.editor = monaco.editor.create(document.getElementById("c"), {
        value: ${code},
        language: "css",
        theme: "vs-dark",
        automaticLayout: true,
      });

      window.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        window.opener?.postMessage({ type: "monaco-save", code: window.editor.getValue() }, "*");
      });
    });
  <\/script>
</body>
</html>`);
    win.document.close();

    const handler = (e: MessageEvent) => {
        if (e.source === win && e.data?.type === "monaco-save") onSave?.(e.data.code);
    };

    window.addEventListener("message", handler);

    return {
        win,
        getValue: () => (win as any).editor?.getValue() as string | undefined,
        dispose: () => window.removeEventListener("message", handler),
    };
}

export const settings = () => (
    <Button
        onClick={() => {
            if (editor && !editor.win.closed) return editor.win.focus();
            editor?.dispose();

            editor = openMonaco(store.css ?? undefined, (code) => {
                applyCss(code);
                store.css = code;
            });
        }}
    >
        Open
    </Button>
);

function applyCss(code: string) {
    if (modifyCss) modifyCss(code);
    else modifyCss = injectCss(code);
}

export const onLoad = () => {
    if (store.css) applyCss(store.css);
};

export const onUnload = () => {
    modifyCss?.();
    modifyCss = undefined;
    editor?.dispose();
    editor?.win.close();
};