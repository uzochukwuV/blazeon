import { compileString } from 'cashc';
import fs from 'fs';
import path from 'path';
import { URL, fileURLToPath } from 'url';
import urlJoin from 'url-join';

interface CompilationCacheItem {
  mtime: number;
}

// Recursively find all .cash files in a directory
const findCashFiles = (dir: string, baseDir: string = dir): { relativePath: string; fullPath: string }[] => {
  const files: { relativePath: string; fullPath: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findCashFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.cash')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({ relativePath, fullPath });
    }
  }

  return files;
};

export const compile = (): void => {
  const cacheDirectory = new URL('../cache', import.meta.url);
  fs.mkdirSync(cacheDirectory, { recursive: true });
  const cacheFile = new URL('../cache/cashc.json', import.meta.url);
  let compilationCache: Record<string, CompilationCacheItem> = {};
  if (fs.existsSync(cacheFile)) {
    compilationCache = JSON.parse(fs.readFileSync(cacheFile, { encoding: 'utf-8' }));
  }

  const artifactsDirectory = new URL('../artifacts', import.meta.url);
  fs.mkdirSync(artifactsDirectory, { recursive: true });

  const contractsDirectory = fileURLToPath(new URL('../contracts', import.meta.url));
  const cashFiles = findCashFiles(contractsDirectory);

  const result = cashFiles.map(({ relativePath, fullPath }) => ({
    fn: relativePath,
    fullPath,
    contents: fs.readFileSync(fullPath, { encoding: 'utf-8' })
  }));

  result.forEach(({ fn, fullPath, contents }) => {
    const mtime = fs.statSync(fullPath).mtimeMs;
    if (!compilationCache[fn] || compilationCache[fn].mtime !== mtime) {
      console.log(`Compiling ${fn}...`);
      const artifact = compileString(contents);

      // Create artifact filename from the contract file name (without subdirectory)
      const artifactName = path.basename(fn).replace('.cash', '.artifact.ts');
      exportArtifact(artifact, new URL(`../artifacts/${artifactName}`, import.meta.url));
      compilationCache[fn] = { mtime };
    }
  });

  // Write the updated cache back to the file
  fs.writeFileSync(cacheFile, JSON.stringify(compilationCache, null, 2), { encoding: 'utf-8' });
};

export const exportArtifact = (obj: object, outPath: string | URL): void => {
  const toTs = (value: any): string => {
    // First, stringify the object with indentation
    let json = JSON.stringify(value, null, 2);

    // Remove quotes from object keys where valid (simple JS identifiers)
    json = json.replace(
      /"([a-zA-Z_][a-zA-Z0-9_]*)":/g,
      '$1:'
    );

    return json;
  };

  const content = `export default ${toTs(obj)} as const;`;
  fs.writeFileSync(outPath, content, { encoding: 'utf-8' });
};

switch (process.argv[2]) {
  case 'compile':
    compile();
    break;
  default:
    console.log('Unknown task');
    break;
}
