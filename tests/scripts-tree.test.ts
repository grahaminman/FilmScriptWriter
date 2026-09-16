import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'
import {
  isInsideScriptsRoot,
  listScriptsTree,
  type ScriptTreeNode
} from '../src/main/scripts-tree'

async function makeRoot(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), 'fsw-scripts-'))
}

function flattenFiles(nodes: ScriptTreeNode[]): ScriptTreeNode[] {
  const out: ScriptTreeNode[] = []
  const walk = (list: ScriptTreeNode[]): void => {
    for (const n of list) {
      if (n.kind === 'file') out.push(n)
      else if (n.children) walk(n.children)
    }
  }
  walk(nodes)
  return out
}

function rels(root: string, files: { path: string }[]): string[] {
  return files.map((f) => path.relative(root, f.path)).sort()
}

describe('listScriptsTree', () => {
  let root = ''

  afterEach(async () => {
    if (root) await rm(root, { recursive: true, force: true })
    root = ''
  })

  it('lists nested .fountain and .txt files and sorts dirs first', async () => {
    root = await makeRoot()
    await writeFile(path.join(root, 'a.fountain'), 'Title: A')
    await mkdir(path.join(root, 'shorts', 'nested'), { recursive: true })
    await writeFile(path.join(root, 'shorts', 'b.fountain'), 'Title: B')
    await writeFile(path.join(root, 'shorts', 'nested', 'c.txt'), 'Title: C')

    const { tree } = await listScriptsTree(root)
    expect(rels(root, flattenFiles(tree))).toEqual([
      'a.fountain',
      path.join('shorts', 'b.fountain'),
      path.join('shorts', 'nested', 'c.txt')
    ])
    expect(tree.map((n) => `${n.kind}:${n.name}`)).toEqual(['dir:shorts', 'file:a.fountain'])
    const shorts = tree[0]
    expect(shorts.kind).toBe('dir')
    expect(shorts.children?.map((n) => `${n.kind}:${n.name}`)).toEqual([
      'dir:nested',
      'file:b.fountain'
    ])
  })

  it('shows a folder that contains only subfolders', async () => {
    root = await makeRoot()
    await mkdir(path.join(root, 'features', 'drafts'), { recursive: true })
    const { tree } = await listScriptsTree(root)
    expect(flattenFiles(tree)).toEqual([])
    expect(tree).toHaveLength(1)
    expect(tree[0]).toMatchObject({ kind: 'dir', name: 'features' })
    expect(tree[0].children?.[0]).toMatchObject({ kind: 'dir', name: 'drafts' })
  })

  it('does not list a symlink pointing outside as a file to open', async () => {
    root = await makeRoot()
    const outsideDir = await mkdtemp(path.join(tmpdir(), 'fsw-outside-'))
    try {
      const outsideFile = path.join(outsideDir, 'secret.fountain')
      await writeFile(outsideFile, 'Title: Secret')
      await writeFile(path.join(root, 'a.fountain'), 'Title: A')
      await symlink(outsideFile, path.join(root, 'link.fountain'))
      await symlink(outsideDir, path.join(root, 'escaped'))

      const { tree } = await listScriptsTree(root)
      const files = flattenFiles(tree)
      expect(rels(root, files)).toEqual(['a.fountain'])
      expect(files.some((f) => f.path === outsideFile || f.name === 'link.fountain')).toBe(
        false
      )
      expect(tree.some((n) => n.name === 'escaped' || n.name === 'link.fountain')).toBe(false)
    } finally {
      await rm(outsideDir, { recursive: true, force: true })
    }
  })

  it('ignores .. traversal and .. entry names', async () => {
    root = await makeRoot()
    await writeFile(path.join(root, 'a.fountain'), 'Title: A')
    const parentFile = path.join(root, '..', `${path.basename(root)}-outside.fountain`)
    await writeFile(parentFile, 'Title: Out')
    try {
      await symlink('..', path.join(root, 'up'))
      const { tree } = await listScriptsTree(root)
      expect(rels(root, flattenFiles(tree))).toEqual(['a.fountain'])
      expect(tree.some((n) => n.name === 'up' || n.name === '..')).toBe(false)
      expect(isInsideScriptsRoot(root, path.resolve(root, '..'))).toBe(false)
      expect(isInsideScriptsRoot(root, path.resolve(root, '..', 'a.fountain'))).toBe(false)
    } finally {
      await rm(parentFile, { force: true })
    }
  })

  it('does not walk past the depth ceiling', async () => {
    root = await makeRoot()
    let dir = root
    for (let i = 1; i <= 9; i++) {
      dir = path.join(dir, `d${i}`)
      await mkdir(dir)
      await writeFile(path.join(dir, `f${i}.fountain`), `Title: ${i}`)
    }
    const { tree } = await listScriptsTree(root)
    const names = flattenFiles(tree).map((f) => f.name)
    expect(names).toContain('f8.fountain')
    expect(names).not.toContain('f9.fountain')
    const dirNames: string[] = []
    const walkDirs = (nodes: typeof tree): void => {
      for (const n of nodes) {
        if (n.kind !== 'dir') continue
        dirNames.push(n.name)
        if (n.children) walkDirs(n.children)
      }
    }
    walkDirs(tree)
    expect(dirNames).toContain('d8')
    expect(dirNames).not.toContain('d9')
  })

  it('skips hidden directories and node_modules', async () => {
    root = await makeRoot()
    await mkdir(path.join(root, '.git', 'objects'), { recursive: true })
    await writeFile(path.join(root, '.git', 'objects', 'hidden.fountain'), 'Title: Git')
    await mkdir(path.join(root, 'node_modules', 'pkg'), { recursive: true })
    await writeFile(path.join(root, 'node_modules', 'pkg', 'dep.fountain'), 'Title: Dep')
    await writeFile(path.join(root, 'a.fountain'), 'Title: A')
    const { tree } = await listScriptsTree(root)
    expect(rels(root, flattenFiles(tree))).toEqual(['a.fountain'])
    expect(tree.map((n) => n.name)).toEqual(['a.fountain'])
  })

  it('caps examined dirents at 2000 including non-script files', async () => {
    root = await makeRoot()
    for (let i = 0; i < 2000; i++) {
      await writeFile(path.join(root, `p${String(i).padStart(4, '0')}.pdf`), 'x')
    }
    await writeFile(path.join(root, 'z.fountain'), 'Title: Z')
    const { tree } = await listScriptsTree(root)
    expect(flattenFiles(tree)).toEqual([])
    expect(tree).toEqual([])
  })

  it('stops listing scripts once the 2000-entry ceiling is reached', async () => {
    root = await makeRoot()
    for (let i = 0; i < 2100; i++) {
      await writeFile(path.join(root, `s${String(i).padStart(4, '0')}.fountain`), 'x')
    }
    const { tree } = await listScriptsTree(root)
    expect(flattenFiles(tree)).toHaveLength(2000)
    expect(tree).toHaveLength(2000)
  })
})
