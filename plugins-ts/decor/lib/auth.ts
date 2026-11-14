import { AUTHORIZE_URL, CLIENT_ID } from "./constants";

const {
  http,
  plugin: { store },
  ui: { openConfirmationModal, showToast },
} = shelter;

export async function authorize(): Promise<boolean> {
  try {
    await openConfirmationModal({
      header: () => "Authorize Decor",
      body: () =>
        "Decor needs your Discord identity (identify scope) to manage your decorations.",
      confirmText: "Authorize",
      type: "confirm",
    });
  } catch {
    return false; // cancelled
  }

  try {
    await http.ready;
    const res = await http.post!({
      url: "/oauth2/authorize",
      query: {
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: AUTHORIZE_URL,
        scope: "identify",
      },
      body: { permissions: "0", authorize: true, integration_type: 0 },
    } as any);

    const url = new URL(res.body.location);
    url.searchParams.append("client", "shelter");

    const req = await fetch(url);
    if (!req.ok) throw new Error(`Decor returned ${req.status}`);

    store.token = await req.text();
    return true;
  } catch (e) {
    showToast({ title: "Decor", content: `Failed to authorize: ${e}` });
    return false;
  }
}
