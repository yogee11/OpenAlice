import { describe, expect, it } from 'vitest'

import { annotateNameCollisions, type IssuesSnapshotWorkspace } from './board.js'

function ws(wsId: string, titles: string[]): IssuesSnapshotWorkspace {
  return {
    wsId,
    tag: wsId,
    status: 'ok',
    issues: titles.map((title, i) => ({
      id: `${wsId}-${i}`,
      title,
      status: 'todo',
      priority: 'none',
      assignee: 'unassigned',
    })),
  }
}

describe('annotateNameCollisions', () => {
  it('flags a name shared across workspaces (case-insensitive) and leaves unique names alone', () => {
    const workspaces = [ws('a', ['Pre-market brief', 'Unique A']), ws('b', ['pre-market brief', 'Unique B'])]
    const dups = annotateNameCollisions(workspaces)

    expect(dups).toEqual(['Pre-market brief']) // first-seen display casing
    expect(workspaces[0].issues[0].nameCollision).toBe(true)
    expect(workspaces[1].issues[0].nameCollision).toBe(true)
    // Unique names are untouched (no false flag).
    expect(workspaces[0].issues[1].nameCollision).toBeUndefined()
    expect(workspaces[1].issues[1].nameCollision).toBeUndefined()
  })

  it('does NOT treat a name repeated WITHIN one workspace as a collision', () => {
    const workspaces = [ws('a', ['Same', 'Same'])]
    const dups = annotateNameCollisions(workspaces)
    expect(dups).toEqual([])
    expect(workspaces[0].issues.every((i) => i.nameCollision === undefined)).toBe(true)
  })

  it('returns an empty list when every name is globally unique', () => {
    const workspaces = [ws('a', ['One']), ws('b', ['Two'])]
    expect(annotateNameCollisions(workspaces)).toEqual([])
  })
})
