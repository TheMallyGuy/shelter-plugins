(function(exports) {

"use strict";

//#region plugins/trustWorthy/index.jsx
var { flux: { storesFlat: r }, patcher: a, observeDom: l, ui: { injectCss: i } } = shelter, s = "[role=\"dialog\"][aria-label=\"Potential Dangerous Download\"]", t = [];
function c() {
	t.push(a.instead("isTrustedDomain", r.MaskedLinkStore, () => !0)), t.push(i(`[class*="layer_"]:has(> ${s}) { display: none !important; }`));
	let e = new WeakSet();
	t.push(l(s, (o) => {
		if (e.has(o)) return;
		let n = o.querySelector("footer button:last-child");
		n && (e.add(o), n.click());
	}));
}
function u() {
	for (let e of t.splice(0)) e();
}

//#endregion
exports.onLoad = c
exports.onUnload = u
return exports;
})({});