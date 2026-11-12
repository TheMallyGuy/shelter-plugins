(function(exports) {

"use strict";

//#region plugins/nsfwBypass/index.js
const { flux: { intercept: R, dispatcher: h, storesFlat: o }, ui: { injectCss: f } } = shelter, S = {
	client_build_number: 88876,
	browser_user_agent: "",
	browser_version: "",
	client_version: "305.1",
	design_id: 2
}, g = /\/api\/v\d+\/channels\/\d+(?:[/?]|$)/, u = 3, _ = `
[class*="obscured"], [class*="Obscured"], [class*="hiddenMosaicItem"] img, [class*="hiddenMosaicItem"] video {
	filter: none !important;
}
[class*="obscureOverlay"], [class*="hiddenOverlay"], [class*="explicitContentWarning"] {
	display: none !important;
}
`;
function l(e) {
	!e || typeof e != "object" || (e.nsfwAllowed = !0, e.nsfw_allowed = !0, e.ageVerificationStatus = u, e.age_verification_status = u);
}
const r = [];
function E() {
	r.push(R((t) => {
		switch (t.type) {
			case "CONNECTION_OPEN":
			case "CURRENT_USER_UPDATE":
			case "USER_UPDATE": l(t.user ?? t);
		}
	}));
	const { open: e, setRequestHeader: c } = XMLHttpRequest.prototype, a = new WeakMap();
	XMLHttpRequest.prototype.open = function(t, s, ...d) {
		return a.set(this, String(s)), e.call(this, t, s, ...d);
	}, XMLHttpRequest.prototype.setRequestHeader = function(t, s) {
		if (t.toLowerCase() === "x-super-properties" && g.test(a.get(this) ?? "")) try {
			s = btoa(JSON.stringify({
				...JSON.parse(atob(s)),
				...S
			}));
		} catch {}
		return c.call(this, t, s);
	}, r.push(() => {
		XMLHttpRequest.prototype.open = e, XMLHttpRequest.prototype.setRequestHeader = c;
	}), r.push(f(_));
	const i = o.UserStore.getCurrentUser();
	i && (l(i), h?.dispatch({
		type: "CURRENT_USER_UPDATE",
		user: i
	}));
	const p = Object.values(o.ChannelStore.getMutableGuildChannelsForGuild?.(o.SelectedGuildStore?.getGuildId?.() ?? "") ?? {})[0] ?? o.ChannelStore.getChannel(o.SelectedChannelStore.getChannelId()), n = p && Object.getPrototypeOf(p);
	if (n && typeof n.isNSFW == "function") {
		const t = n.isNSFW;
		n.isNSFW = () => !1, r.push(() => n.isNSFW = t);
	}
}
function U() {
	for (const e of r.splice(0)) e();
}

//#endregion
exports.onLoad = E
exports.onUnload = U
return exports;
})({});