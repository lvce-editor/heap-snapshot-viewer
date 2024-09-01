import * as JsonCompletion from '../JsonCompletion/JsonCompletion.ts'
import * as JsonHover from '../JsonHover/JsonHover.ts'
import * as Selection from '../Selection/Selection.ts'

export const commandMap = {
  'Selection.expand': Selection.expand,
  'Completion.getCompletion': JsonCompletion.jsonCompletion,
  'Completion.resolve': JsonCompletion.resolve,
  'Hover.getHover': JsonHover.getHover,
}
