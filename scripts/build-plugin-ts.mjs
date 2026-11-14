import { build, context } from "esbuild";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "plugins-ts", OUT = "plugins";
const watchIdx = process.argv.indexOf("--watch");
const devPlugin = watchIdx === -1 ? null : process.argv[watchIdx + 1];

if (watchIdx !== -1 && (!devPlugin || !existsSync(join(SRC, devPlugin)))) {
	const names = readdirSync(SRC, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
	if (devPlugin) console.error(`no such plugin: ${devPlugin}`);
	console.error(`Usage: pnpm dev <plugin>   (one of: ${names.join(", ")})`);
	process.exit(1);
}

for (const name of readdirSync(SRC, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
	const dir = join(SRC, name);

	const entry = readdirSync(dir).find((f) => /^index\.(tsx?|jsx)$/.test(f));
	if (!entry) {
		console.warn(`skipping ${name}: no index.ts(x)`);
		continue;
	}


	const outDir = join(OUT, name);
	const expected = new Set(["plugin.json", "index.jsx"]);
	mkdirSync(outDir, { recursive: true });

	for (const f of readdirSync(outDir)) if (!expected.has(f)) rmSync(join(outDir, f), { recursive: true, force: true });

	const manifest = readFileSync(join(dir, "plugin.json"), "utf8");
	const outManifest = join(outDir, "plugin.json");
	if (!existsSync(outManifest) || readFileSync(outManifest, "utf8") !== manifest) writeFileSync(outManifest, manifest);

	const opts = {
		entryPoints: [join(dir, entry)],
		outdir: join(OUT, name),
		format: "esm",
		target: "esnext",
		jsx: "preserve",
		bundle: true,
		packages: "external",
		outExtension: { ".js": ".jsx" },
		minify: true
	};

	if (devPlugin) await (await context(opts)).watch();
	else await build(opts);
}

console.log("ts -> plugins done!");

if (devPlugin) spawn("lune dev", { cwd: join(OUT, devPlugin), stdio: "inherit", shell: true });
