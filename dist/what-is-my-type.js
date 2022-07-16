export const whatsMyType = (someObject) => (someObject && someObject.constructor && someObject.constructor.name && someObject.constructor.name) || null;
