import * as Assert from '../Assert/Assert.ts'
import * as CamelCase from '../CamelCase/CamelCase.ts'
import * as CreateHeapSnapshotNode from '../CreateHeapSnapshotNode/CreateHeapSnapshotNode.ts'

export const parseHeapSnapshotObjects = (
  values,
  valueFields,
  valueTypes,
  typeKey,
  nameKey,
  indexMultiplierKey,
  indexMultiplier,
  strings,
) => {
  Assert.array(values)
  Assert.array(valueFields)
  Assert.array(valueTypes)
  const parsed: any[] = []
  const nodeFieldCount = valueFields.length
  const camelCaseNodeFields = valueFields.map(CamelCase.camelCase)
  for (let i = 0; i < values.length; i += nodeFieldCount) {
    const node = CreateHeapSnapshotNode.createHeapSnapshotNode(
      values,
      i,
      camelCaseNodeFields,
      valueTypes,
      typeKey,
      nameKey,
      indexMultiplierKey,
      indexMultiplier,
      strings,
    )
    if (i === 91497) {
      console.log({ raw: values[91497 + 3] })
      console.log({ special: node })
    }
    parsed.push(node)
  }
  return parsed
}
