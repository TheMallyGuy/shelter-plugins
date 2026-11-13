(function(exports) {

//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion

//#region solid-js/web
var require_web = __commonJS({ "solid-js/web"(exports, module) {
	module.exports = shelter.solidWeb;
} });

//#endregion
//#region plugins/polishWording/index.jsx
var import_web = __toESM(require_web(), 1);
var import_web$1 = __toESM(require_web(), 1);
var import_web$2 = __toESM(require_web(), 1);
var import_web$3 = __toESM(require_web(), 1);
var import_web$4 = __toESM(require_web(), 1);
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<div><!#><!/><!#><!/></div>`, 6);
var { plugin: { store: r }, http: { intercept: O }, ui: { SwitchItem: C, TextBox: L, Text: M, Divider: R } } = shelter;
O("post", /\/channels\/\d+\/messages/, (t, e) => (t.body.content = E(t.body.content), e(t)));
var W = () => [
	(0, import_web$4.createComponent)(C, {
		get value() {
			return r.fixApostrophes;
		},
		onChange: (t) => {
			r.fixApostrophes = t;
		},
		children: "Fix Apostrophes"
	}),
	(0, import_web$4.createComponent)(C, {
		get value() {
			return r.expandContractions;
		},
		onChange: (t) => {
			r.expandContractions = t;
		},
		children: "Expand Contractions"
	}),
	(0, import_web$4.createComponent)(C, {
		get value() {
			return r.fixCapitalization;
		},
		onChange: (t) => {
			r.fixCapitalization = t;
		},
		children: "Fix Capitalization"
	}),
	(0, import_web$4.createComponent)(C, {
		get value() {
			return r.fixPunctuation;
		},
		onChange: (t) => {
			r.fixPunctuation = t;
		},
		children: "Punctate sentences"
	}),
	(() => {
		const _el$ = (0, import_web$1.getNextElement)(_tmpl$), _el$2 = _el$.firstChild, [_el$3, _co$] = (0, import_web$2.getNextMarker)(_el$2.nextSibling), _el$4 = _el$3.nextSibling, [_el$5, _co$2] = (0, import_web$2.getNextMarker)(_el$4.nextSibling);
		_el$.style.setProperty("display", "flex");
		_el$.style.setProperty("align-items", "center");
		_el$.style.setProperty("gap", "8px");
		(0, import_web$3.insert)(_el$, (0, import_web$4.createComponent)(M, {
			style: {
				"white-space": "nowrap",
				"flex-shrink": 0
			},
			children: "Punctuation Frequency"
		}), _el$3, _co$);
		(0, import_web$3.insert)(_el$, (0, import_web$4.createComponent)(L, {
			style: { flex: 1 },
			get value() {
				return r.fixPunctuationFrequency;
			},
			onInput: (t) => {
				r.fixPunctuationFrequency = t;
			}
		}), _el$5, _co$2);
		return _el$;
	})(),
	(0, import_web$4.createComponent)(R, {})
];
function E(t) {
	let e = t, o = /```[\s\S]*?```|`[\s\S]*?`/g, n = [];
	return e = e.replace(o, (i) => (n.push(i), `__CODE_BLOCK_${n.length - 1}__`)), (r.fixApostrophes || r.expandContractions) && (e = F(e)), r.fixCapitalization && (e = Z(e)), r.fixPunctuation && Math.random() * 100 < r.fixPunctuationFrequency && (e = D(e)), r.expandContractions && (e = $(e)), e = e.replace(/__CODE_BLOCK_(\d+)__/g, (i, s) => n[parseInt(s)]), e;
}
var v = {
	"wasn't": "was not",
	"can't": "cannot",
	"don't": "do not",
	"won't": "will not",
	"isn't": "is not",
	"aren't": "are not",
	"haven't": "have not",
	"hasn't": "has not",
	"hadn't": "had not",
	"doesn't": "does not",
	"didn't": "did not",
	"shouldn't": "should not",
	"wouldn't": "would not",
	"couldn't": "could not",
	"that's": "that is",
	"what's": "what is",
	"there's": "there is",
	"how's": "how is",
	"where's": "where is",
	"when's": "when is",
	"who's": "who is",
	"why's": "why is",
	"you'll": "you will",
	"i'll": "I will",
	"they'll": "they will",
	"it'll": "it will",
	"i'm": "I am",
	"you're": "you are",
	"they're": "they are",
	"he's": "he is",
	"she's": "she is",
	"i've": "I have",
	"you've": "you have",
	"we've": "we have",
	"they've": "they have",
	"you'd": "you would",
	"he'd": "he would",
	"she'd": "she would",
	"it'd": "it would",
	"we'd": "we would",
	"they'd": "they would",
	"y'all": "you all",
	"here's": "here is"
}, b = {};
for (let t in v) {
	let e = B(t.toLowerCase());
	b[e] = t;
}
function S(t) {
	let e = [];
	for (let o of t) o.match(/[a-zA-Z]/) && e.push(o === o.toUpperCase());
	return e;
}
function P(t, e) {
	let o = "", n = 0;
	for (let i = 0; i < t.length; i++) {
		let s = t[i];
		if (!s.match(/[a-zA-Z]/)) {
			o += s;
			continue;
		}
		let a = e[n];
		o += a ? s.toUpperCase() : s.toLowerCase(), n < e.length - 1 && n++;
	}
	return o;
}
function F(t) {
	let e = Object.keys(b);
	if (e.length === 0) return t;
	let o = new RegExp(`\\b(${e.join("|")})\\b`, "gi");
	return t.replace(o, (n) => {
		let i = n.toLowerCase();
		if (Object.prototype.hasOwnProperty.call(b, i)) {
			let s = b[i];
			return P(s, S(n));
		}
		return n;
	});
}
function $(t) {
	let e = new RegExp(`\\b(${Object.keys(v).join("|")})\\b`, "gi");
	return t.replace(e, (o) => {
		let n = o.toLowerCase();
		return Object.prototype.hasOwnProperty.call(v, n) ? P(v[n], S(o)) : o;
	});
}
function B(t) {
	return t.replace(/'/g, "");
}
function Z(t) {
	let e = /((?<!\w\.\w.)(?<!\b[A-Z][a-z]\.)(?<![A-Z]\.)(?<!\.)(?<=[.?!])\s+|\n+)/, n = t.split(e).filter((s) => s != null), i = "";
	for (let s = 0; s < n.length; s++) {
		let a = n[s];
		if (!e.test(a)) {
			if (a) {
				if (a.trim() === "") {
					i += a;
					continue;
				}
			} else continue;
			let A = a.match(/^\s*([\w'-]+)/), U = A ? A[1].toLowerCase() : "";
			a.startsWith("http") ? i += a : i += a.replace(/^(\s*)(\S)/, (T, _, I) => _ + I.toUpperCase());
		} else a && (i += a);
	}
	return i = i.replace(/\bi\b(?!\s+is\b)(?=['\s]|$)/g, "I"), i;
}
function D(t) {
	if (!t) return "";
	let e = t.split(`
`), o = [];
	for (let n = 0; n < e.length; n++) {
		let s = e[n].trimEnd(), a = /https?:\/\/\S+$|www\.\S+$/;
		if (!s) n < e.length - 1 && o.push("");
else {
			let m = s.slice(-1);
			if (/[A-Za-z0-9]/.test(m) && !a.test(s)) {
				o.push(s + ".");
				continue;
			}
			o.push(s);
		}
	}
	return o.join(`
`);
}

//#endregion
exports.settings = W
return exports;
})({});