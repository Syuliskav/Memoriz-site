import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Regex patterns to detect forbidden literal Tailwind colors
const FORBIDDEN_PATTERNS = [
  // Literal palette colors like bg-slate-100, text-blue-600, border-orange-500, etc.
  /\b(?:bg|text|border|ring|divide|from|to|via|accent|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)(?:\/\d+)?\b/g,
  
  // Literal white/black background and text (should use surface, canvas, primary, accent-contrast)
  /\b(?:bg|border)-(?:white|black)(?:\/\d+)?\b/g,

  // Dark variant literal overrides like dark:bg-slate-800, dark:text-white
  /\bdark:(?:bg|text|border|ring)-(?:slate|gray|zinc|neutral|stone|white|black|[a-z]+-\d+)(?:\/\d+)?\b/g,
];

// Whitelist of files allowed to define tokens
const ALLOWED_FILES = [
  'themeTokens.ts',
  'index.css',
  'verify-colors.mjs',
];

function scanDirectory(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDirectory(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      if (!ALLOWED_FILES.some(f => fullPath.endsWith(f))) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const files = scanDirectory(srcDir);
let violationCount = 0;
const report = [];

for (const file of files) {
  const relativePath = path.relative(rootDir, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip single-line comments or token definitions if any
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

    for (const pattern of FORBIDDEN_PATTERNS) {
      pattern.lastIndex = 0;
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          violationCount++;
          report.push({
            file: relativePath,
            line: index + 1,
            match,
            content: trimmed,
          });
        });
      }
    }
  });
}

if (violationCount > 0) {
  console.error(`\n🚨 THEME TOKEN VIOLATION DETECTED: Found ${violationCount} literal Tailwind color classes!`);
  console.error('All colors must use semantic tokens (--theme-*, bg-surface, text-primary, text-accent, etc.)');
  console.error('-----------------------------------------------------------------------------------');
  
  // Group by file for clean reporting
  const byFile = {};
  for (const item of report) {
    if (!byFile[item.file]) byFile[item.file] = [];
    byFile[item.file].push(item);
  }

  for (const [f, items] of Object.entries(byFile)) {
    console.error(`\n📄 ${f} (${items.length} violations):`);
    items.slice(0, 10).forEach(i => {
      console.error(`   Line ${i.line}: "${i.match}" in -> ${i.content.substring(0, 80)}`);
    });
    if (items.length > 10) {
      console.error(`   ... e mais ${items.length - 10} ocorrências neste arquivo.`);
    }
  }

  console.error('\n❌ Build blocked by Theme Regression Guard (scripts/verify-colors.mjs)\n');
  process.exit(1);
} else {
  console.log('✅ Theme Token Verification: 100% of scanned files comply with semantic tokens! Zero literal Tailwind colors found.');
  process.exit(0);
}
