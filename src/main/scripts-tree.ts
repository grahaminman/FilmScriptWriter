import * as fs from 'fs/promises'
import * as path from 'path'

/** Caps so a huge dump or cycle cannot stall the sidebar or leak watches. */
export const SCRIPTS_TREE_MAX_DEPTH = 8
export const SCRIPTS_TREE_MAX_ENTRIES = 2000

export interface ScriptTreeNode {
  kind: 'file' | 'dir'
  name: string
  path: string
  realPath: string
  relativePath: string
  children?: ScriptTreeNode[]
}

interface ScriptsTreeResult {
  tree: ScriptTreeNode[]
  dirs: string[]
}

function isUnsafeName(name: string): boolean {
  if (name === '' || name === '.' || name === '..') return true
  if (name.includes('/') || name.includes('\\') || name.includes('\0')) return true
  return false
}

function isSkippedName(name: string): boolean {
  if (isUnsafeName(name)) return true
  if (name.startsWith('.')) return true
  if (name === 'node_modules') return true
  return false
}

function isScriptExt(name: string): boolean {
  const ext = path.extname(name).toLowerCase()
  return ext === '.fountain' || ext === '.txt'
}

function normalizeForCompare(p: string): string {
  const resolved = path.resolve(p)
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved
}

export function isInsideScriptsRoot(rootReal: string, candidateReal: string): boolean {
  const rel = path.relative(normalizeForCompare(rootReal), normalizeForCompare(candidateReal))
  if (!rel) return true
  if (path.isAbsolute(rel)) return false
  return rel.split(/[/\\]/)[0] !== '..'
}

function sortNodes(a: ScriptTreeNode, b: ScriptTreeNode): number {
  if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
}

export async function listScriptsTree(root: string): Promise<ScriptsTreeResult> {
  const dirs: string[] = []
  const visited = new Set<string>()
  let remaining = SCRIPTS_TREE_MAX_ENTRIES

  const logicalRoot = path.resolve(root)
  const rootReal = await fs.realpath(logicalRoot)
  const rootStat = await fs.stat(rootReal)
  if (!rootStat.isDirectory()) {
    throw new Error('not a directory')
  }
  visited.add(normalizeForCompare(rootReal))
  dirs.push(logicalRoot)

  async function resolveInside(full: string): Promise<string | null> {
    let real: string
    try {
      real = await fs.realpath(full)
    } catch {
      return null
    }
    if (!isInsideScriptsRoot(rootReal, real)) return null
    return real
  }

  async function walk(
    logicalDir: string,
    rel: string,
    depth: number
  ): Promise<ScriptTreeNode[]> {
    if (depth > SCRIPTS_TREE_MAX_DEPTH || remaining <= 0) return []
    let names: string[]
    try {
      names = await fs.readdir(logicalDir)
    } catch {
      return []
    }
    names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

    const nodes: ScriptTreeNode[] = []
    for (const name of names) {
      if (remaining <= 0) break
      if (isSkippedName(name)) continue
      remaining -= 1

      const full = path.join(logicalDir, name)
      let lst: Awaited<ReturnType<typeof fs.lstat>>
      try {
        lst = await fs.lstat(full)
      } catch {
        continue
      }

      const relativePath = rel ? `${rel}/${name}` : name
      const looksLikeScript = isScriptExt(name)

      if (lst.isFile()) {
        if (!looksLikeScript) continue
        const real = await resolveInside(full)
        if (!real) continue
        nodes.push({ kind: 'file', name, path: full, realPath: real, relativePath })
        continue
      }

      if (lst.isSymbolicLink() && looksLikeScript) {
        const real = await resolveInside(full)
        if (!real) continue
        try {
          const st = await fs.stat(real)
          if (st.isFile()) {
            nodes.push({ kind: 'file', name, path: full, realPath: real, relativePath })
            continue
          }
        } catch {
          continue
        }
      }

      const maybeDir = lst.isDirectory() || lst.isSymbolicLink()
      if (!maybeDir || depth >= SCRIPTS_TREE_MAX_DEPTH) continue

      const real = await resolveInside(full)
      if (!real) continue
      if (lst.isSymbolicLink()) {
        try {
          const st = await fs.stat(real)
          if (!st.isDirectory()) continue
        } catch {
          continue
        }
      }
      const key = normalizeForCompare(real)
      if (visited.has(key)) continue
      visited.add(key)
      dirs.push(full)
      const children = await walk(full, relativePath, depth + 1)
      nodes.push({
        kind: 'dir',
        name,
        path: full,
        realPath: real,
        relativePath,
        children
      })
    }

    nodes.sort(sortNodes)
    return nodes
  }

  const tree = await walk(logicalRoot, '', 0)
  return { tree, dirs }
}
