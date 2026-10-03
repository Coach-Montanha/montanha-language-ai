import { createJiti } from "jiti";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const jiti = createJiti(__filename, {
  alias: {
    "@": path.join(projectRoot, "src"),
  },
});

async function main() {
  console.log("=== RUNNING DEEP VERIFICATION TESTS ===");
  await jiti.import("./deep-verify.ts");

  console.log("\n=== RUNNING GAMIFICATION & AVATAR VERIFICATION TESTS ===");
  await jiti.import("./gamification-verify.ts");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
