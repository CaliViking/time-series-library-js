export enum Severity {
  'Good' = 0,
  'Uncertain' = 1,
  'Bad' = 2,
} // It is important that the order is preserved as Good is less than Uncertain which is less than Bad. Maps to OPC UA Severity https://reference.opcfoundation.org/v104/Core/docs/Part4/7.34.1/
