import { build, context } from "esbuild";
import { spawn } from "node:child_process";
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const SRC = "plugins-ts", OUT = "plugins";
const watchIdx = process.argv.indexOf("--watch");
const devPlugin = watchIdx === -1 ? null : (process.argv[watchIdx + 1] ?? "folderGroups");

for (const name of readdirSync(SRC, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
	const dir = join(SRC, name);
	const entries = readdirSync(dir).filter((f) => /\.(tsx?|jsx)$/.test(f));

	mkdirSync(join(OUT, name), { recursive: true });
	for (const f of readdirSync(join(OUT, name))) rmSync(join(OUT, name, f), { recursive: true, force: true });
	cpSync(join(dir, "plugin.json"), join(OUT, name, "plugin.json"));

	const opts = {
		entryPoints: entries.map((f) => join(dir, f)),
		outdir: join(OUT, name),
		format: "esm",
		target: "esnext",
		jsx: "preserve",
		bundle: false,
		// .jsx so lune runs its Solid JSX transform on the preserved JSX.
		outExtension: { ".js": ".jsx" },
		minify: true
	};

	if (devPlugin) await (await context(opts)).watch();
	else await build(opts);
}

console.log("ts -> plugins done!");

if (devPlugin) spawn("lune dev", { cwd: join(OUT, devPlugin), stdio: "inherit", shell: true });
