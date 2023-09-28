import { $Values } from "utility-types";
const BOUNDING_BOX_GROUPS = {
  OVERVIEW: 'OVERVIEW'
};
export type BoundingBoxGroup = $Values<typeof BOUNDING_BOX_GROUPS>;
export default BOUNDING_BOX_GROUPS;