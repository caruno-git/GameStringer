/**
 * Audit script for lib/ directory - Find unused utility files
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const LIB_DIR = path.join(PROJECT_ROOT, 'lib');
const APP_DIR = path.join(PROJECT_ROOT, 'app');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'components');
const HOOKS_DIR = path.join(PROJECT_ROOT, 'hooks');

// Extensions to scan
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Get all lib files
function getAllLibFiles() {
  const files = [];
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (SOURCE_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(LIB_DIR);
  return files;
}

// Extract imports from source file
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  
  // Match @/lib/ imports
  const libImportRegex = /@\/lib\/([^'"\s]+)/g;
  let match;
  while ((match = libImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

// Resolve import path to actual file
function resolveImportPath(importPath, fromFile) {
  // Handle relative imports from lib
  const basePath = path.join(LIB_DIR, importPath);
  
  // Try different extensions
  for (const ext of SOURCE_EXTENSIONS) {
    const fullPath = basePath + ext;
    if (fs.existsSync(fullPath)) return fullPath;
  }
  
  // Try index files
  for (const ext of SOURCE_EXTENSIONS) {
    const indexPath = path.join(basePath, 'index' + ext);
    if (fs.existsSync(indexPath)) return indexPath;
  }
  
  return null;
}

// Get all source files that might import lib files
function getAllSourceFiles() {
  const files = [];
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanDir(fullPath);
      } else if (SOURCE_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(APP_DIR);
  scanDir(COMPONENTS_DIR);
  scanDir(HOOKS_DIR);
  
  return files;
}

// Main audit
console.log('🔍 Auditing lib/ directory for unused files...\n');

const libFiles = getAllLibFiles();
console.log(`📁 Found ${libFiles.length} files in lib/`);

const sourceFiles = getAllSourceFiles();
console.log(`📄 Scanning ${sourceFiles.length} source files for imports...\n`);

// Track which lib files are imported
const usedLibFiles = new Set();

for (const sourceFile of sourceFiles) {
  const imports = extractImports(sourceFile);
  for (const imp of imports) {
    const resolved = resolveImportPath(imp, sourceFile);
    if (resolved) {
      usedLibFiles.add(resolved);
    }
  }
}

// Find unused lib files
const unusedLibFiles = libFiles.filter(f => !usedLibFiles.has(f));

// Group by directory
const byDir = {};
for (const file of unusedLibFiles) {
  const dir = path.dirname(file).replace(LIB_DIR + path.sep, '');
  if (!byDir[dir]) byDir[dir] = [];
  byDir[dir].push(path.basename(file));
}

console.log('='.repeat(60));
console.log(`🚨 POTENTIALLY UNUSED LIB FILES (${unusedLibFiles.length})`);
console.log('='.repeat(60));

for (const [dir, files] of Object.entries(byDir).sort()) {
  console.log(`\n📂 lib/${dir}/`);
  for (const f of files.sort()) {
    console.log(`   ⚠️  ${f}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`USED LIB FILES: ${usedLibFiles.size}/${libFiles.length}`);
console.log(`UNUSED: ${unusedLibFiles.length}`);
console.log('='.repeat(60));

// Export for review
if (unusedLibFiles.length > 0) {
  console.log('\n📋 Full paths for review:');
  for (const f of unusedLibFiles) {
    console.log(`   ${f.replace(PROJECT_ROOT + path.sep, '')}`);
  }
}
