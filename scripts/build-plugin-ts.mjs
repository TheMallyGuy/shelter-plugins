import { build } from "esbuild";
import { cpSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SRC = "plugins-ts", OUT = "plugins";

for (const name of readdirSync(SRC, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
	const dir = join(SRC, name);
	const entries = readdirSync(dir).filter((f) => /\.(tsx?|jsx)$/.test(f));

	mkdirSync(join(OUT, name), { recursive: true });
	cpSync(join(dir, "plugin.json"), join(OUT, name, "plugin.json"));

	await build({
		entryPoints: entries.map((f) => join(dir, f)),
		outdir: join(OUT, name),
		format: "esm",
		target: "esnext",
		jsx: "preserve",
		bundle: false,
		outExtension: { ".js": ".js" },
		minify: true
	});
}

console.log("ts -> plugins done!");
