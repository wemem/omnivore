import { EntityTarget, ObjectLiteral } from "typeorm"
import { affineDataSource } from "../../data_source"

export const getRepository = <T extends ObjectLiteral>(
  entity: EntityTarget<T>
) => {
  return affineDataSource.getRepository(entity)
}