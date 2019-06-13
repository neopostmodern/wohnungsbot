const BOUNDING_BOX_GROUPS = {
  OVERVIEW: 'OVERVIEW',
  PRIVACY_MASK: 'PRIVACY_MASK'
};

export type BoundingBoxGroup = $Values<typeof BOUNDING_BOX_GROUPS>;

export default BOUNDING_BOX_GROUPS;
