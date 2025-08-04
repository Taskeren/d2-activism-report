import { execSync } from "node:child_process"
import { copyFileSync } from "node:fs"
import { readdirSync } from "node:fs"
import { join } from "node:path"
import dotenv from "dotenv"

dotenv.config()

if (!process.env.BUNGIE_API_KEY) {
	throw new Error("Bungie API key is required! Using environment 'BUNGIE_API_KEY'.")
}

// step 1: generate the i18n files
try {
	execSync("node dist/index.js", {
		stdio: "inherit",
		env: {
			...process.env,
		},
		cwd: "i18n-generator",
	})
} catch (error) {
	console.error("Error executing i18n-generator script:", error)
	process.exit(1)
}

// step 2: copy the generated files to the desired location
try {
	const srcDir = "i18n-generator/out"
	const destDir = "static/localization/generated"
	for (const file of readdirSync(srcDir)) {
		const srcFile = join(srcDir, file)
		const destFile = join(destDir, file)
		copyFileSync(srcFile, destFile)
	}
} catch (error) {
	console.error("Error copying i18n files:", error)
	process.exit(1)
}
