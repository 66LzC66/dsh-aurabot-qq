// 数据目录、JSON 读写（UTF-8 无 BOM、先写临时文件再改名）。

import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'

export function dshHome() {
  return process.env.DSH_HOME || join(homedir(), '.dsh')
}

// 本机把数据目录挪到 D 盘（C 盘空间紧张）。优先级：环境变量 > 本机固定路径（该目录真实存在时）> DSH 默认。
// 只在目录真实存在时才用固定路径：换机器、或删掉该目录后自动回落到 DSH 默认位置，行为与上游一致。
const LOCAL_DATA_ROOT = 'D:\\dsh-data\\aurabot'

/** 插件所有数据都放这儿：默认 ~/.dsh/plugins-data/aurabot/（本机改到了 D 盘） */
export function dataDir(...parts) {
  const base =
    process.env.AURABOT_DATA_DIR ||
    (existsSync(LOCAL_DATA_ROOT) ? LOCAL_DATA_ROOT : join(dshHome(), 'plugins-data', 'aurabot'))
  return join(base, ...parts)
}

export function ensureDir(p) {
  mkdirSync(p, { recursive: true })
  return p
}

export function readJson(file, fallback) {
  try {
    let text = readFileSync(file, 'utf8')
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
    return JSON.parse(text)
  } catch (error) {
    return typeof fallback === 'function' ? fallback() : fallback
  }
}

export function writeJson(file, value) {
  ensureDir(dirname(file))
  const tmp = `${file}.tmp-${process.pid}`
  writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8')
  renameSync(tmp, file)
}

export { existsSync }
