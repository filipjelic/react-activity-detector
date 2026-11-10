// Webpack's minifier strips the "use client" directive from src/ActivityDetector.js
// because it isn't JS syntax webpack/terser recognizes as meaningful. Next.js App
// Router requires that literal directive to be the very first thing in the file to
// treat the module as a Client Component, so it's re-added here after the build,
// immune to further minification.
const fs = require("fs");
const path = require("path");

const BUILT_FILE = path.resolve(__dirname, "..", "lib", "ActivityDetector.js");
const DIRECTIVE = '"use client";\n';

const contents = fs.readFileSync(BUILT_FILE, "utf8");

if (!contents.startsWith(DIRECTIVE)) {
  fs.writeFileSync(BUILT_FILE, DIRECTIVE + contents);
}
