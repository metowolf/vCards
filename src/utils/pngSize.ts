import { isPng } from './isPng'

export interface PngSize {
  width: number
  height: number
}

// 从 PNG 的 IHDR 块读取宽高：偏移 16 起为宽度，20 起为高度（均为 4 字节大端序）
export const pngSize = (bytes: Uint8Array): PngSize | null => {
  if (!isPng(bytes) || bytes.length < 24) {
    return null
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return {
    width: view.getUint32(16),
    height: view.getUint32(20)
  }
}
