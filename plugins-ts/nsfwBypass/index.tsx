const {
	flux: { intercept, getDispatcher, storesFlat: stores },
	ui: { injectCss }
} = shelter;

const SUPER_PROPERTIES_OVERRIDE = {
	client_build_number: 88876,
	browser_user_agent: "",
	browser_version: "",
	client_version: "305.1",
	design_id: 2
};

const CHANNEL_RE = /\/api\/v\d+\/channels\/\d+(?:[/?]|$)/;
const VERIFIED_ADULT = 3;

const UNBLUR_CSS = `
[class*="obscured"], [class*="Obscured"], [class*="hiddenMosaicItem"] img, [class*="hiddenMosaicItem"] video {
	filter: none !important;
}
[class*="obscureOverlay"], [class*="hiddenOverlay"], [class*="explicitContentWarning"] {
	display: none !important;
}
`;

function spoofUser(u: any) {
	if (!u || typeof u !== "object") return;
	u.nsfwAllowed = true;
	u.nsfw_allowed = true;
	u.ageVerificationStatus = VERIFIED_ADULT;
	u.age_verification_status = VERIFIED_ADULT;
}

const disposers: (() => void)[] = [];

export function onLoad() {
	disposers.push(
		intercept((payload) => {
			switch (payload.type) {
				case "CONNECTION_OPEN":
				case "CURRENT_USER_UPDATE":
				case "USER_UPDATE":
					spoofUser(payload.user ?? payload);
			}
			return undefined;
		})
	);

	const { open, setRequestHeader } = XMLHttpRequest.prototype;
	const urls = new WeakMap<XMLHttpRequest, string>();

	XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string | URL, ...rest: any[]) {
		urls.set(this, String(url));
		return (open as any).call(this, method, url, ...rest);
	};

	XMLHttpRequest.prototype.setRequestHeader = function (this: XMLHttpRequest, name: string, value: string) {
		if (name.toLowerCase() === "x-super-properties" && CHANNEL_RE.test(urls.get(this) ?? "")) {
			try {
				value = btoa(JSON.stringify({ ...JSON.parse(atob(value)), ...SUPER_PROPERTIES_OVERRIDE }));
			} catch {
				// leave header untouched
			}
		}
		return setRequestHeader.call(this, name, value);
	};

	disposers.push(() => {
		XMLHttpRequest.prototype.open = open;
		XMLHttpRequest.prototype.setRequestHeader = setRequestHeader;
	});

	disposers.push(injectCss(UNBLUR_CSS));

	const me = stores.UserStore.getCurrentUser();
	if (me) {
		spoofUser(me);
		getDispatcher().then((d: any) => d.dispatch({ type: "CURRENT_USER_UPDATE", user: me }));
	}

	const ch = Object.values(stores.ChannelStore.getMutableGuildChannelsForGuild?.(stores.SelectedGuildStore?.getGuildId?.() ?? "") ?? {})[0]
		?? stores.ChannelStore.getChannel(stores.SelectedChannelStore.getChannelId());
	const proto = ch && Object.getPrototypeOf(ch);
	if (proto && typeof proto.isNSFW === "function") {
		const orig = proto.isNSFW;
		proto.isNSFW = () => false;
		disposers.push(() => (proto.isNSFW = orig));
	}
}

export function onUnload() {
	for (const d of disposers.splice(0)) d();
}
