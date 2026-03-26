#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const bessemerDir = join(rootDir, 'bessemer');
const docsDir = join(rootDir, 'docs');

// Clean docs directory
if (existsSync(docsDir)) {
  rmSync(docsDir, { recursive: true, force: true });
}
mkdirSync(docsDir, { recursive: true });

// Get all packages
const packages = readdirSync(bessemerDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`Found ${packages.length} packages to process...`);

// Process each package
const processedPackages = [];
for (const pkg of packages) {
  const packageDocsDir = join(bessemerDir, pkg, 'docs');

  if (!existsSync(packageDocsDir)) {
    console.log(`  ⊘ Skipping ${pkg} (no docs generated)`);
    continue;
  }

  console.log(`  ✓ Processing ${pkg}...`);

  // Create destination directory
  const destDir = join(docsDir, pkg);
  mkdirSync(destDir, { recursive: true });

  // Copy all files from package docs to root docs
  const copyRecursive = (src, dest) => {
    if (!existsSync(src)) return;

    const entries = readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else {
        let content = readFileSync(srcPath, 'utf-8');

        // Update frontmatter to set parent to package name
        if (entry.name.endsWith('.md')) {
          content = content.replace(
            /^---\n/,
            `---\nparent: ${pkg}\n`
          );
        }

        writeFileSync(destPath, content);
      }
    }
  };

  copyRecursive(packageDocsDir, destDir);
  processedPackages.push(pkg);
}

// Create index page for each package
for (const pkg of processedPackages) {
  const indexPath = join(docsDir, pkg, 'index.md');
  const indexContent = `---
title: ${pkg}
has_children: true
nav_order: ${processedPackages.indexOf(pkg) + 1}
---

# ${pkg}

Documentation for the \`@bessemer/${pkg}\` package.
`;

  writeFileSync(indexPath, indexContent);
}

// Create main index page
const mainIndexContent = `---
title: Home
nav_order: 1
---

# Bessemer Documentation

Welcome to the Bessemer documentation.

## Packages

${processedPackages.map(pkg => `- [${pkg}](${pkg}/)`).join('\n')}
`;

writeFileSync(join(docsDir, 'index.md'), mainIndexContent);

console.log(`\n✓ Documentation aggregation complete!`);
console.log(`  Processed ${processedPackages.length} packages: ${processedPackages.join(', ')}`);
