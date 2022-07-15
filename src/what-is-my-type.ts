export const whatsMyType = (someObject: unknown) =>
  (someObject && someObject.constructor && someObject.constructor.name && someObject.constructor.name) || null;
