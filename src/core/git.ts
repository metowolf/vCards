import { $ } from 'bun'

// git log 输出形如 `2024-05-01 12:00:00 +0800`，去掉时区后按本地时间解析（与历史行为保持一致）
const lastCommitTime = async (filePath: string): Promise<number> => {
  const output = await $`git log -1 --pretty=format:%ci -- ${filePath}`.text()
  return new Date(output.trim().replace(/\s\+\d+$/, '')).getTime()
}

/**
 * 取 YAML 与同名 PNG 中较新的 git 提交时间，作为 vCard 的 REV。
 * CardDAV 客户端依赖该字段判断联系人是否更新。
 */
export const gitRevision = async (yamlPath: string): Promise<string> => {
  const [yamlTime, pngTime] = await Promise.all([
    lastCommitTime(yamlPath),
    lastCommitTime(yamlPath.replace(/\.yaml$/, '.png'))
  ])

  return new Date(Math.max(yamlTime, pngTime)).toISOString()
}
