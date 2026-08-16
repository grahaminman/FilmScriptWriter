import { describe, it, expect } from 'vitest'
import {
  FOUNTAIN_SYNTAX_TOPICS,
  SYNTAX_GROUPS,
  topicById
} from '../src/shared/fountain/syntax-reference'
import { COACH_TO_TOPIC } from '../src/shared/fountain/syntax-reference'

describe('Fountain syntax reference', () => {
  it('covers the main Fountain elements', () => {
    const ids = FOUNTAIN_SYNTAX_TOPICS.map((t) => t.id)
    for (const need of [
      'what',
      'title',
      'scene',
      'action',
      'character',
      'dialogue',
      'note',
      'boneyard',
      'dual',
      'transition',
      'emphasis',
      'cheatsheet'
    ]) {
      expect(ids).toContain(need)
    }
  })

  it('gives every topic a syntax line and a body', () => {
    for (const topic of FOUNTAIN_SYNTAX_TOPICS) {
      expect(topic.syntax.trim().length).toBeGreaterThan(0)
      expect(topic.body.trim().length).toBeGreaterThan(40)
      expect(SYNTAX_GROUPS.some((g) => g.id === topic.group)).toBe(true)
    }
  })

  it('maps live-coach ids onto real topics', () => {
    for (const topicId of Object.values(COACH_TO_TOPIC)) {
      expect(topicById(topicId)).toBeDefined()
    }
  })
})
