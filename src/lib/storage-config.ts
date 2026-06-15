/** True when UploadThing cloud storage is configured (persistent in production). */
export function isCloudStorageEnabled(): boolean {
  return Boolean(process.env.UPLOADTHING_TOKEN?.trim());
}
