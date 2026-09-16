import * as fs from 'fs/promises'
import * as path from 'path'

/** Caps so a huge dump or cycle cannot stall the sidebar or leak watches. */
export const SCRIPTS_TREE_MAX_DEPTH = 8
export const SCRIPTS_TREE_MAX_ENTRIES = 2000

export interface ScriptFileInfo {
  name: string
  path: string
}

export interface ScriptTreeNode {
  kind: 'file' | 'dir'
  name: string
  path: string
  relativePath: string
  children?: ScriptTreeNode[]
}

interface ScriptsTreeResult {
  tree: ScriptTreeNode[]
  files: ScriptFileInfo[]
  dirs: string[]
}

function isUnsafeName(name: string): boolean {
  if (name === '' || name === '.' || name === '..') return true
  if (name.includes('/') || name.includes('\\') || name.includes('\0')) return true
  return false
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
  const files: ScriptFileInfo[] = []
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

    const nodes: ScriptTreeNode[] = []
    for (const name of names) {
      if (remaining <= 0) break
      if (isUnsafeName(name)) continue
      const full = path.join(logicalDir, name)
      let lst: Awaited<ReturnType<typeof fs.lstat>>
      try {
        lst = await fs.lstat(full)
      } catch {
        continue
      }

      let real: string
      try {
        real = await fs.realpath(full)
      } catch {
        continue
      }
      if (!isInsideScriptsRoot(rootReal, real)) continue

      let isDir = lst.isDirectory()
      let isFile = lst.isFile()
      if (lst.isSymbolicLink()) {
        try {
          const st = await fs.stat(real)
          isDir = st.isDirectory()
          isFile = st.isFile()
        } catch {
          continue
        }
      }

      const relativePath = rel ? `${rel}/${name}` : name

      if (isDir) {
        const key = normalizeForCompare(real)
        if (visited.has(key)) continue
        visited.add(key)
        remaining -= 1
        dirs.push(full)
        const children = await walk(full, relativePath, depth + 1)
        nodes.push({ kind: 'dir', name, path: full, relativePath, children })
        continue
      }

      if (!isFile) continue
      const ext = path.extname(name).toLowerCase()
      if (ext !== '.fountain' && ext !== '.txt') continue
      remaining -= 1
      nodes.push({ kind: 'file', name, path: full, relativePath })
      files.push({ name, path: full })
    }

    nodes.sort(sortNodes)
    return nodes
  }

  const tree = await walk(logicalRoot, '', 0)
  return { tree, files, dirs }
}
