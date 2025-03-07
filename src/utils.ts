import path from 'path'
import minimatch from 'minimatch'
import { Options } from './types'

export interface ResolveComponent {
  filename: string
  namespace?: string
}

export function normalize(str: string) {
  return capitalize(camelize(str))
}

export function camelize(str: string) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function toArray<T>(arr: T | T[]): T[] {
  if (Array.isArray(arr))
    return arr
  return [arr]
}

export function isEmpty(value: any) {
  if (!value || value === null || value === undefined || (Array.isArray(value) && Object.keys(value).length <= 0))
    return true

  else
    return false
}

export function matchGlobs(filepath: string, globs: string[]) {
  for (const glob of globs) {
    if (minimatch(filepath, glob))
      return true
  }
  return false
}

export function getNameFromFilePath(filePath: string, options: Options): string {
  const { dirs, directoryAsNamespace, globalNamespaces } = options

  const parsedFilePath = path.parse(filePath)

  let strippedPath = ''

  // remove include directories from filepath
  for (const dir of toArray(dirs)) {
    if (parsedFilePath.dir.startsWith(dir)) {
      strippedPath = parsedFilePath.dir.slice(dir.length)
      break
    }
  }

  let folders = strippedPath.slice(1).split('/').filter(Boolean)
  let filename = parsedFilePath.name

  // set parent directory as filename if it is index
  if (filename === 'index' && !directoryAsNamespace) {
    filename = `${folders.slice(-1)[0]}`
    return filename
  }

  if (directoryAsNamespace) {
    // remove namesspaces from folder names
    if (globalNamespaces.some((name: string) => folders.includes(name)))
      folders = folders.filter(f => !globalNamespaces.includes(f))

    if (filename.toLowerCase() === 'index')
      filename = ''

    if (!isEmpty(folders)) {
      // add folders to filename
      filename = [...folders, filename].filter(Boolean).join('-')
    }

    console.log('!!!', filename)
    return filename
  }

  return filename
}

export function resolveAlias(filepath: string, alias: Record<string, string>) {
  let result = filepath
  Object.entries(alias).forEach(([k, p]) => {
    if (k.startsWith('/') && k.endsWith('/') && result.startsWith(k))
      result = path.join(p, result.replace(k, ''))
  })
  return result
}
