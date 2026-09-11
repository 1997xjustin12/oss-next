import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Build scripts under scripts/ are CommonJS by extension, so `require` is
  // the correct call there — not a lapse to be rewritten as an ESM import.
  {
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  // The visitor's ZIP has exactly one write path: saveVisitorZip() in
  // lib/visitorZip.ts, or useGeoapify's selectResult, which calls it. Writing
  // the keys directly skips the address-bar fix and the broadcast every
  // listing link listens for — which is how two writers used to save a
  // location that updated no link at all. This makes the mistake a lint error
  // for a component that has not been written yet.
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["lib/visitorZip.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.property.name='setItem'][arguments.0.value=/^zipcode(_label|_depot)?$/]",
          message:
            "Save the visitor's ZIP with saveVisitorZip() from @/lib/visitorZip (or useGeoapify's selectResult), so the URL, storage and every listing link update together.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
