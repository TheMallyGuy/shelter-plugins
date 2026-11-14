// Ported from Vencord's timezones plugin api.ts

const {
  http,
  plugin: { store },
  ui: { showToast, ToastColors, openConfirmationModal },
  util: { log },
} = shelter;

const databaseTimezones: Record<string, { value: string | null }> = {};
const CLIENT_ID = "1377021506810417173";

const getDomain = (): string => store.databaseUrl || "https://timezone.creations.works";
const getRedirectUri = (): string => `${getDomain()}/auth/discord/callback`;

const toast = (content: string, color = ToastColors.SUCCESS) =>
  showToast({ title: "Timezones", content, color, duration: 3000 });

function handleApiError(error: any, defaultMessage: string): void {
  log([defaultMessage, error], "error");
  toast(error?.message || defaultMessage, ToastColors.CRITICAL);
}

async function safeJsonParse(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return { message: "Invalid response format" };
  }
}

export function setUserDatabaseTimezone(userId: string, timezone: string | null) {
  databaseTimezones[userId] = { value: timezone };
}

export function getTimezone(userId: string): string | null {
  return databaseTimezones[userId]?.value ?? null;
}

export async function loadDatabaseTimezones(): Promise<boolean> {
  try {
    const res = await fetch(`${getDomain()}/list`, { headers: { Accept: "application/json" } });
    if (!res.ok) return false;
    const json = await res.json();
    for (const id in json) databaseTimezones[id] = { value: json[id]?.timezone ?? null };
    return true;
  } catch (e) {
    log(["Failed to fetch timezones list:", e], "error");
    return false;
  }
}

async function checkAuthentication(): Promise<boolean> {
  try {
    const res = await fetch(`${getDomain()}/me`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

const withAuth = async (fn: () => Promise<boolean>) => (await checkAuthentication()) || (await authorize()) ? fn() : false;

export const setTimezone = (timezone: string) => withAuth(() => setTimezoneInternal(timezone));
export const deleteTimezone = () => withAuth(deleteTimezoneInternal);

async function setTimezoneInternal(timezone: string): Promise<boolean> {
  try {
    const res = await fetch(`${getDomain()}/set`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      credentials: "include",
      body: new URLSearchParams({ timezone }),
    });
    if (!res.ok) {
      handleApiError(await safeJsonParse(res), "Failed to set timezone");
      return false;
    }
    toast("Timezone updated successfully!");
    return true;
  } catch (e) {
    handleApiError(e, "Failed to set timezone");
    return false;
  }
}

async function deleteTimezoneInternal(): Promise<boolean> {
  try {
    const res = await fetch(`${getDomain()}/delete`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (!res.ok) {
      handleApiError(await safeJsonParse(res), "Failed to delete timezone");
      return false;
    }
    toast("Timezone deleted successfully!");
    return true;
  } catch (e) {
    handleApiError(e, "Failed to delete timezone");
    return false;
  }
}


export async function authorize(): Promise<boolean> {
  const host = URL.parse(getDomain())?.host ?? getDomain();
  try {
    await openConfirmationModal({
      header: () => "Authorize Timezones",
      body: () => `Authorize ${host} to read your Discord identity? Only the "identify" scope is requested.`,
      confirmText: "Authorize",
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
        redirect_uri: getRedirectUri(),
        scope: "identify",
      },
      body: { authorize: true, permissions: "0" },
    });
    const location: string | undefined = res.body?.location;
    if (!location) {
      handleApiError(res.body, "Authorization failed");
      return false;
    }

    const r = await fetch(location, { credentials: "include", headers: { Accept: "application/json" } });
    if (!r.ok) {
      handleApiError(await safeJsonParse(r), "Authorization failed");
      return false;
    }
    toast("Authorization successful!");
    return true;
  } catch (e) {
    handleApiError(e, "Unexpected error during authorization");
    return false;
  }
}
