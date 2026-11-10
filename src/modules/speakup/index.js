// 内置模块：主动搭话。主人一阵子没找她时，她会在私聊里主动找主人聊几句（群里不会）。

import { createSpeakUp } from '../../features/companion.js'

export default {
  id: 'speakup',
  name: '主动搭话',
  version: '1.0.0',
  description: '主人一阵子没理她时，在私聊里主动找主人说话',
  tab: 'speakup',
  files: ['features/companion.js'],
  setup(api) {
    const { hub, mutes } = api.core
    // 睡觉状态由「长夜如梦」这类模块管；没装就一直是 false，不影响主动搭话。
    // 只读 state.mode，不用 snapshot()——那个每次都会重算睡眠阶段和整晚计划，而我们一分钟问一次。
    const asleep = () => {
      const night = api.use('night')
      if (!night) return false
      if (typeof night.isAsleep === 'function') return Boolean(night.isAsleep())
      const mode = night.service?.state?.mode ?? night.snapshot?.()?.mode
      return mode === 'asleep'
    }
    const speakUp = createSpeakUp({ getConfig: api.config, hub, log: api.log, isMuted: (chatId) => mutes.muted(chatId), memory: () => api.use('memory'), asleep })
    api.every(60_000, () => speakUp.tick(), '主动搭话')
    api.route('/speakup/fire', async () => {
      if (!api.config().enabled) return { ok: false, message: '先打开总开关' }
      await speakUp.fire('手动')
      return { ok: true, message: '叫她去找你了' }
    })
    return speakUp
  },
}
