// PNG 文件头（magic number）：89 50 4E 47 0D 0A 1A 0A
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const

export const isPng = (bytes: Uint8Array | null | undefined): boolean => {
  if (!bytes || bytes.length < PNG_SIGNATURE.length) {
    return false
  }

  return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)
}
