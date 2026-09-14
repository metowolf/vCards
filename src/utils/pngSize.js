import isPng from './isPng.js'

// 从 PNG 的 IHDR 块读取宽高：偏移 16 起为宽度，20 起为高度（均为 4 字节大端序）
const pngSize = (buffer) => {
	if (!isPng(buffer) || buffer.length < 24) {
		return null
	}

	return {
		width: buffer.readUInt32BE(16),
		height: buffer.readUInt32BE(20)
	}
}

export default pngSize
