import path from 'node:path';

export function isInside(directory, file, paths = path) {
  const child = paths.relative(directory, file);
  return child !== '' && child !== '..' && !child.startsWith('..' + paths.sep) && !paths.isAbsolute(child);
}
