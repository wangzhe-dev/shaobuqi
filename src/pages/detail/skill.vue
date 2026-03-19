<template>
	<view class="page">

		<!-- 自定义导航栏 -->
		<view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar-inner">
				<view class="nav-back" @tap="goBack">
					<uni-icons class="nav-back-icon" type="left" size="20" color="#1A1A1A" />
				</view>
				<text class="nav-title">Skill 详情</text>
				<view class="nav-actions">
					<view class="nav-btn" @tap="shareSkill">
						<uni-icons class="nav-btn-icon" type="paperplane" size="20" color="rgba(0,0,0,0.70)" />
					</view>
					<view class="nav-btn" @tap="reportSkill">
						<uni-icons class="nav-btn-icon" type="more-filled" size="20" color="rgba(0,0,0,0.70)" />
					</view>
				</view>
			</view>
		</view>

		<scroll-view class="main-scroll" scroll-y :show-scrollbar="false">
			<!-- 1. 顶部概览区 -->
			<view class="overview-section">
				<view class="scene-tag">{{ skill.scene }}</view>
				<text class="skill-title">{{ skill.title }}</text>

				<view class="author-row">
					<view class="author-av" :style="{ background: skill.authorColor }">
						<text class="author-av-t">{{ skill.author[0] }}</text>
					</view>
					<text class="author-name">{{ skill.author }}</text>
					<text class="publish-time">{{ skill.publishTime }}</text>
					<view class="follow-btn" @tap="followAuthor">
						<text class="follow-btn-text">关注</text>
					</view>
				</view>

				<!-- 数据概览 -->
				<view class="overview-stats">
					<view class="ov-stat">
						<text class="ov-stat-val">{{ skill.copyCount }}</text>
						<text class="ov-stat-label">复制数</text>
					</view>
					<view class="ov-divider" />
					<view class="ov-stat">
						<text class="ov-stat-val">{{ skill.favoriteCount }}</text>
						<text class="ov-stat-label">收藏数</text>
					</view>
					<view class="ov-divider" />
					<view class="ov-stat">
						<text class="ov-stat-val green">{{ skill.successRate }}</text>
						<text class="ov-stat-label">复现率</text>
					</view>
					<view class="ov-divider" />
					<view class="ov-stat">
						<text class="ov-stat-val">{{ skill.feedbackCount }}</text>
						<text class="ov-stat-label">反馈数</text>
					</view>
				</view>
			</view>

      <!-- 简介 -->
      <view class="skill-intro">
        <text class="si-title">简介</text>
        <text class="si-text">{{ skill.brief }}</text>
        <!-- 图片九宫格 -->
        <view v-if="skill.images && skill.images.length" class="skill-imgs"
          :class="`gi-${skill.images.length <= 4 ? skill.images.length : 'many'}`">
          <image v-for="(src, i) in skill.images.slice(0, 9)" :key="i"
            :src="src" class="skill-img" mode="aspectFill"
            @tap="previewSkillImage(skill.images, i)" />
        </view>
      </view>

      <!-- 使用场景 -->
      <view class="scene-block">
        <text class="sb-title">使用场景</text>
        <view class="scene-chip-list">
          <view v-for="scene in skill.useScenes" :key="scene" class="scene-chip">
            <text class="scene-chip-text">{{ scene }}</text>
          </view>
        </view>
      </view>

				<!-- 4. Skill 正文区 -->
					<view class="section-card skill-content-card">
						<view class="section-header">
							<uni-icons class="section-badge" type="list" size="18" color="#5E738A" />
							<text class="section-title">Skill 内容</text>
							<view class="copy-all-btn" @tap="copyAll">
								<uni-icons class="copy-all-icon" type="list" size="13" color="#E45C1A" />
								<text class="copy-all-text">复制全部</text>
							</view>
						</view>

					<view class="skill-content-panel">
						<rich-text v-if="promptHtmlNodes" class="scp-rich" :nodes="promptHtmlNodes" />
						<text v-else class="scp-text">{{ skill.fullPrompt }}</text>
					</view>

					<view v-if="Array.isArray(skill.contentImages) && skill.contentImages.length" class="content-img-block">
						<text class="content-img-title">内容图片</text>
						<view class="content-img-grid">
							<image
								v-for="(img, idx) in skill.contentImages"
								:key="`${img}-${idx}`"
								class="content-img"
								:src="img"
								mode="aspectFill"
								@tap="previewContentImage(idx)"
							/>
						</view>
					</view>
				</view>

			<view v-if="variableNotesText" class="section-card variable-notes-card">
				<view class="section-header">
					<uni-icons class="section-badge" type="info-filled" size="18" color="#7B5B3C" />
					<text class="section-title">变量说明</text>
				</view>
				<text class="vn-text">{{ variableNotesText }}</text>
			</view>

				<!-- 5. 使用步骤 -->
				<view class="section-card">
					<view class="section-header">
						<uni-icons class="section-badge" type="paperplane-filled" size="18" color="#2F8A57" />
						<text class="section-title">使用步骤</text>
						<text class="section-subtitle">复制后按顺序操作</text>
					</view>

				<view class="steps-list">
					<view v-for="(step, idx) in skill.steps" :key="idx" class="step-item">
						<view class="step-num">
							<text class="step-num-text">{{ idx + 1 }}</text>
						</view>
						<text class="step-text">{{ step }}</text>
					</view>
				</view>
			</view>

			<!-- 6. 复现反馈区（结构化，非普通评论区） -->
			<view class="section-card">
				<view class="section-header">
					<uni-icons class="section-badge" type="chatbubble-filled" size="18" color="#5E738A" />
					<text class="section-title">复现反馈</text>
					<view class="write-feedback-btn" @tap="writeFeedback">
						<text class="write-fb-text">写反馈</text>
					</view>
				</view>

				<view class="feedback-list">
					<view v-for="fb in skill.feedbacks" :key="fb.id" class="feedback-card">
						<view class="fb-head">
							<view class="fb-av" :style="{ background: fb.userColor }">
								<text class="fb-av-t">{{ fb.userName[0] }}</text>
							</view>
							<view class="fb-meta">
								<text class="fb-name">{{ fb.userName }}</text>
								<text class="fb-time">{{ fb.time }}</text>
							</view>
							<view class="fb-status-badge" :class="'status-' + fb.status">
								<text class="fb-status-text">{{ statusLabel(fb.status) }}</text>
							</view>
						</view>

						<!-- 使用数据 -->
						<view class="fb-token-row">
							<view class="fbt-item">
								<text class="fbt-label">模型</text>
								<text class="fbt-val model">{{ fb.model }}</text>
							</view>
							<view class="fbt-item">
								<text class="fbt-label">输入</text>
								<text class="fbt-val orange">{{ fb.inputToken }}</text>
							</view>
							<view class="fbt-item">
								<text class="fbt-label">输出</text>
								<text class="fbt-val orange">{{ fb.outputToken }}</text>
							</view>
							<view class="fbt-item">
								<text class="fbt-label">总 token</text>
								<text class="fbt-val orange">{{ fb.totalToken }}</text>
							</view>
						</view>

						<text class="fb-comment">{{ fb.comment }}</text>
					</view>
				</view>
			</view>

			<!-- 7. 相似推荐 -->
			<view class="section-card">
				<view class="section-header">
					<uni-icons class="section-badge" type="star-filled" size="18" color="#D6943A" />
					<text class="section-title">相似推荐</text>
				</view>

				<view class="similar-list">
					<view v-for="s in skill.similarSkills" :key="s.id" class="similar-item" @tap="toSkill(s.id)">
						<view class="si-info">
							<text class="si-tag">{{ s.tag }}</text>
							<text class="si-title">{{ s.title }}</text>
							<view class="si-meta">
								<view class="si-token-wrap">
									<uni-icons type="fire-filled" size="12" color="#E45C1A" />
									<text class="si-token orange">{{ s.avgToken }}</text>
								</view>
								<text class="si-rate green">{{ s.successRate }} 复现</text>
							</view>
						</view>
						<view class="si-copy-btn" @tap.stop="copyQuick(s)">
							<text class="si-copy-text">复制</text>
						</view>
					</view>
				</view>
			</view>

			<view class="detail-bottom" />
		</scroll-view>

		<!-- 底部固定操作栏 -->
		<view class="bottom-bar">
			<view class="bb-fav" @tap="toggleFavorite">
				<uni-icons
					class="bb-fav-icon"
					:type="isFavorited ? 'star-filled' : 'star'"
					size="18"
					:color="isFavorited ? '#E45C1A' : 'rgba(0,0,0,0.50)'"
				/>
				<text class="bb-fav-text">收藏</text>
			</view>
			<view class="bb-copy-btn" @tap="copySkill">
				<uni-icons class="bb-copy-icon" type="fire-filled" size="16" color="#FFFFFF" />
				<text class="bb-copy-text">复制 Skill</text>
			</view>
		</view>

		<!-- 复制成功引导弹层 -->
		<view v-if="showCopyGuide" class="copy-guide-overlay" @tap="showCopyGuide = false">
			<view class="copy-guide-sheet" @tap.stop>
				<view class="cg-title-row">
					<uni-icons type="checkmarkempty" size="18" color="#2F8A57" />
					<text class="cg-title">已复制 Skill！</text>
				</view>
				<text class="cg-subtitle">接下来你想做什么？</text>
				<view class="cg-actions">
					<view class="cg-btn" @tap="goUse">
						<uni-icons class="cg-btn-icon" type="paperplane-filled" size="18" color="#E45C1A" />
						<text class="cg-btn-text">去使用</text>
					</view>
					<view class="cg-btn" @tap="saveFavorite">
						<uni-icons class="cg-btn-icon" type="star-filled" size="18" color="#D6943A" />
						<text class="cg-btn-text">收藏到我的 Skill</text>
					</view>
					<view class="cg-btn" @tap="recordResult">
						<uni-icons class="cg-btn-icon" type="compose" size="18" color="#5E738A" />
						<text class="cg-btn-text">记录一次结果</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { useSysInfoStore } from '@/stores'

	const sysInfo = useSysInfoStore()
	const statusBarHeight = computed(() => (sysInfo.systemInfo as any).statusBarHeight || 44)
	const PUBLISHED_SKILL_PREVIEW_KEY = 'latest_published_skill_v1'

	const isFavorited = ref(false)
	const showCopyGuide = ref(false)

	const SKILL_LIBRARY: Record<string, any> = {
		s1: {
			id: 's1',
			title: 'PS 人像精修提示词（参数版）',
			scene: '设计',
			author: '阿泽修图',
			authorColor: '#D6943A',
			publishTime: '2026-03-18',
			copyCount: '8.3k',
			favoriteCount: '2.1k',
			successRate: '93%',
			feedbackCount: '168',
			brief: '适合把“照片问题”变成可执行的 PS 操作步骤，包含工具、顺序和参数区间。',
			useScenes: ['人像精修', '电商主图', '写真后期', '证件照优化'],
			images: ['https://picsum.photos/seed/skill1a/600/400', 'https://picsum.photos/seed/skill1b/600/400', 'https://picsum.photos/seed/skill1c/600/400'],
			avgInputToken: '0.7k',
			avgOutputToken: '1.2k',
			avgTotalToken: '1.9k',
			estimatedCost: '¥0.02~0.06',
			recommendedModel: 'GPT-4.1',
			commonModel: 'Claude Sonnet',
			showConsume: true,
			totalUses: '2,986',
			weekUses: '746',
			fullPrompt: `【你是谁】
你是一名资深 PS 修图师，熟悉 Camera Raw、曲线、HSL、高低频、蒙版、液化等常用工具。

【你要做什么】
根据我提供的照片问题，给我一套“可直接照着做”的修图方案。
请按“先后顺序”写清楚每一步，不要只讲概念。

【输出要求】
1. 先给“问题诊断”：这张图主要问题是什么。
2. 再给“修图步骤”：每步写工具、操作方式、建议参数范围。
3. 最后给“避坑提醒”：哪些地方容易修过头。
4. 如果我给的信息不够，不要反问，直接按默认参数给完整方案。

【固定参数（默认执行）】
- 输出步骤数量：6~8步
- 每步包含：工具 + 操作 + 参数范围
- 默认参数：曝光 +0.25、对比 +12、高光 -35、阴影 +18、清晰度 +8
- 磨皮强度默认中等，保留皮肤纹理
- 禁止先提问，直接给修图方案

【我会提供这些信息】
照片类型：{照片类型}
当前问题：{当前问题}
目标风格：{目标风格}
软件版本：{软件版本}
是否商用：{是否商用}`,
			variables: [
				{ name: '照片类型', desc: '如“室内人像”“电商白底图”' },
				{ name: '当前问题', desc: '如“肤色发灰、噪点重、背景脏”' },
				{ name: '目标风格', desc: '如“自然通透”“高级胶片感”' },
				{ name: '软件版本', desc: '如“Photoshop 2024”' },
				{ name: '是否商用', desc: '是/否，商用时更强调自然和合规' }
			],
			variableNotes: `{当前问题}尽量写具体，结果会更稳
{目标风格}不要写太泛，建议给参考方向
{是否商用}会影响修图强度建议`,
			steps: [
				'复制 Skill 到对话框',
				'把照片问题按变量补充完整',
				'按 AI 给的顺序在 PS 里执行',
				'根据“避坑提醒”回看并微调'
			],
			feedbacks: [
				{ id: 's1-f1', userName: '林楠', userColor: '#9A6530', time: '2天前', model: 'GPT-4.1', inputToken: '0.6k', outputToken: '1.1k', totalToken: '1.7k', status: 'success', comment: '给到的参数区间很实用，电商图返修率明显下降。' },
				{ id: 's1-f2', userName: '小莫', userColor: '#7B5B3C', time: '4天前', model: 'Claude Sonnet', inputToken: '0.8k', outputToken: '1.3k', totalToken: '2.1k', status: 'success', comment: '以前只会乱调，现在按步骤做，肤色稳定很多。' }
			],
			similarSkills: [
				{ id: 's4', title: '电商主图卖点文案生成器', tag: '电商', avgToken: '1.5k', successRate: '91%' },
				{ id: 's5', title: '短视频口播脚本生成器', tag: '自媒体', avgToken: '1.8k', successRate: '89%' },
				{ id: 's2', title: '前端 Bug 定位与修复助手', tag: '编程', avgToken: '2.1k', successRate: '90%' }
			]
		},
		s2: {
			id: 's2',
			title: '前端 Bug 定位与修复助手',
			scene: '编程',
			author: '周知行',
			authorColor: '#9A6530',
			publishTime: '2026-03-15',
			copyCount: '7.6k',
			favoriteCount: '2.0k',
			successRate: '90%',
			feedbackCount: '142',
			brief: '先定位再修复，输出最小可行补丁和回归测试点，适合 Vue/React 项目。',
			useScenes: ['线上报错', '页面白屏', '接口异常', '性能抖动'],
			images: ['https://picsum.photos/seed/skill2a/600/400', 'https://picsum.photos/seed/skill2b/600/400'],
			avgInputToken: '1.1k',
			avgOutputToken: '1.0k',
			avgTotalToken: '2.1k',
			estimatedCost: '¥0.03~0.08',
			recommendedModel: 'Claude Sonnet',
			commonModel: 'GPT-4.1',
			showConsume: true,
			totalUses: '2,541',
			weekUses: '611',
			fullPrompt: `【你是谁】
你是一名资深前端工程师，擅长快速定位线上问题并给出最小改动修复方案。

【你要做什么】
我会给你报错信息和代码片段，你需要：
1. 先判断最可能的根因（按概率排序）
2. 给出最小可行修复代码
3. 给出回归测试清单，防止改坏其他功能

【输出格式】
根因判断：
- 高概率：
- 中概率：

修复方案：
- 改动点：
- 代码示例：

回归检查：
- 检查项1
- 检查项2

【固定参数（默认执行）】
- 只输出最小可行修复（避免大改）
- 默认技术栈：Vue3 + TypeScript + Vite
- 如果缺运行环境，按“现代浏览器 + Node 18”处理
- 代码示例优先给可直接替换片段
- 禁止先提问，直接给排查与修复结果

【我会提供这些信息】
错误信息：{错误信息}
相关代码：{相关代码}
运行环境：{运行环境}
期望结果：{期望结果}`,
			variables: [
				{ name: '错误信息', desc: '完整报错堆栈或控制台错误' },
				{ name: '相关代码', desc: '最小可复现片段' },
				{ name: '运行环境', desc: '如“Vue3 + Vite + iOS Safari”' },
				{ name: '期望结果', desc: '修复后希望达到的行为' }
			],
			variableNotes: '',
			steps: ['复制 Skill', '贴入报错和代码', '先看根因排序再改代码', '按回归清单逐项验证'],
			feedbacks: [
				{ id: 's2-f1', userName: '张开源', userColor: '#2F8A57', time: '3天前', model: 'Claude Sonnet', inputToken: '1.2k', outputToken: '1.0k', totalToken: '2.2k', status: 'success', comment: '给出的最小补丁非常干净，20分钟就修完线上问题。' },
				{ id: 's2-f2', userName: '阿青', userColor: '#7B5B3C', time: '1周前', model: 'GPT-4.1', inputToken: '1.0k', outputToken: '1.1k', totalToken: '2.1k', status: 'normal', comment: '定位很准，回归清单很有用。' }
			],
			similarSkills: [
				{ id: 's3', title: '会议纪要行动项提取器', tag: '办公', avgToken: '1.2k', successRate: '93%' },
				{ id: 's6', title: '英语口语陪练教练', tag: '学习', avgToken: '1.6k', successRate: '88%' },
				{ id: 's1', title: 'PS 人像精修提示词（参数版）', tag: '设计', avgToken: '1.9k', successRate: '93%' }
			]
		},
		s3: {
			id: 's3',
			title: '会议纪要行动项提取器',
			scene: '办公',
			author: '刘效率',
			authorColor: '#2F8A57',
			publishTime: '2026-03-14',
			copyCount: '6.9k',
			favoriteCount: '1.8k',
			successRate: '93%',
			feedbackCount: '126',
			brief: '把会议记录拆成决策、行动项、负责人和截止日期，直接可发到群里执行。',
			useScenes: ['项目例会', '产品评审', '销售复盘', '跨部门沟通'],
			images: ['https://picsum.photos/seed/skill3a/600/400'],
			avgInputToken: '0.8k',
			avgOutputToken: '0.4k',
			avgTotalToken: '1.2k',
			estimatedCost: '¥0.01~0.04',
			recommendedModel: 'GPT-4o-mini',
			commonModel: 'GPT-4o-mini',
			showConsume: true,
			totalUses: '2,210',
			weekUses: '589',
			fullPrompt: `【你是谁】
你是一名项目管理助理，擅长把杂乱会议内容整理成可执行清单。

【你要做什么】
把会议内容整理成：
1. 已确认决策
2. 待办事项（负责人+截止时间）
3. 风险与阻塞
4. 下一次同步时间建议

【输出格式】
请用表格输出“待办事项”，其余用分点列出。
如果会议内容里没有负责人或截止时间，请明确标注“待补充”。

【固定参数（默认执行）】
- 必须输出：决策、待办、风险、下次同步建议
- 截止时间默认：今天起 +3 个工作日
- 负责人缺失时默认标“待分配”
- 每条待办默认一句“可验收标准”
- 禁止先提问，直接给整理结果

【我会提供这些信息】
会议原文：{会议原文}
项目名称：{项目名称}
今天日期：{今天日期}`,
			variables: [
				{ name: '会议原文', desc: '录音转文字或手记原文' },
				{ name: '项目名称', desc: '方便归档和追踪' },
				{ name: '今天日期', desc: '用于推断截止日期' }
			],
			variableNotes: '',
			steps: ['粘贴会议原文', '补项目名和日期', '核对负责人/时间是否完整', '直接发布到团队群'],
			feedbacks: [
				{ id: 's3-f1', userName: '孟涛', userColor: '#9A6530', time: '1天前', model: 'GPT-4o-mini', inputToken: '0.7k', outputToken: '0.5k', totalToken: '1.2k', status: 'success', comment: '输出特别规整，抄过去就能执行。' },
				{ id: 's3-f2', userName: '阿丽', userColor: '#7B5B3C', time: '4天前', model: 'GPT-4o-mini', inputToken: '0.9k', outputToken: '0.4k', totalToken: '1.3k', status: 'success', comment: '以前做纪要要40分钟，现在10分钟内搞定。' }
			],
			similarSkills: [
				{ id: 's2', title: '前端 Bug 定位与修复助手', tag: '编程', avgToken: '2.1k', successRate: '90%' },
				{ id: 's4', title: '电商主图卖点文案生成器', tag: '电商', avgToken: '1.5k', successRate: '91%' },
				{ id: 's5', title: '短视频口播脚本生成器', tag: '自媒体', avgToken: '1.8k', successRate: '89%' }
			]
		},
		s4: {
			id: 's4',
			title: '电商主图卖点文案生成器',
			scene: '电商',
			author: '许稳稳',
			authorColor: '#7B5B3C',
			publishTime: '2026-03-12',
			copyCount: '5.9k',
			favoriteCount: '1.7k',
			successRate: '91%',
			feedbackCount: '117',
			brief: '聚焦主图一句话卖点，适合淘宝/拼多多/抖店等电商平台。',
			useScenes: ['主图卖点', '详情页首屏', '活动海报', '直播间贴片'],
			images: ['https://picsum.photos/seed/skill4a/600/400', 'https://picsum.photos/seed/skill4b/600/400', 'https://picsum.photos/seed/skill4c/600/400', 'https://picsum.photos/seed/skill4d/600/400'],
			avgInputToken: '0.6k',
			avgOutputToken: '0.9k',
			avgTotalToken: '1.5k',
			estimatedCost: '¥0.02~0.05',
			recommendedModel: 'GPT-4.1',
			commonModel: 'Claude Sonnet',
			showConsume: true,
			totalUses: '1,982',
			weekUses: '502',
			fullPrompt: `【你是谁】
你是一位电商文案策划，擅长把产品特性写成“用户一眼看懂”的卖点话术。

【你要做什么】
请根据产品信息，输出 5 条主图卖点文案，每条不超过 16 个字。
另外再给 3 条副标题补充说明，每条不超过 24 个字。

【要求】
1. 不要夸大宣传，不写虚假承诺
2. 优先突出差异化和使用结果
3. 语气要像真实商家，不要像机器

【固定参数（默认执行）】
- 主图文案：5条，每条 <=16字
- 副标题：3条，每条 <=24字
- 语气默认：直接、利落、可感知
- 若缺竞品短板：默认按“同价位功能一般”处理
- 禁止先提问，直接输出可用文案

【我会提供这些信息】
产品名称：{产品名称}
核心优势：{核心优势}
目标人群：{目标人群}
竞品短板：{竞品短板}
禁用词：{禁用词}`,
			variables: [
				{ name: '产品名称', desc: '你的商品名' },
				{ name: '核心优势', desc: '建议1~3条' },
				{ name: '目标人群', desc: '主要购买人群' },
				{ name: '竞品短板', desc: '有助于写差异化' },
				{ name: '禁用词', desc: '品牌合规词库' }
			],
			variableNotes: '',
			steps: ['补全商品信息', '先选3条主图卖点', '再选副标题组合', '投放后按转化复盘'],
			feedbacks: [
				{ id: 's4-f1', userName: '小妍', userColor: '#D6943A', time: '3天前', model: 'GPT-4.1', inputToken: '0.6k', outputToken: '0.8k', totalToken: '1.4k', status: 'success', comment: '主图点击率比原来提升了12%。' }
			],
			similarSkills: [
				{ id: 's1', title: 'PS 人像精修提示词（参数版）', tag: '设计', avgToken: '1.9k', successRate: '93%' },
				{ id: 's5', title: '短视频口播脚本生成器', tag: '自媒体', avgToken: '1.8k', successRate: '89%' },
				{ id: 's3', title: '会议纪要行动项提取器', tag: '办公', avgToken: '1.2k', successRate: '93%' }
			]
		},
		s5: {
			id: 's5',
			title: '短视频口播脚本生成器',
			scene: '自媒体',
			author: '王创作',
			authorColor: '#7B5B3C',
			publishTime: '2026-03-10',
			copyCount: '5.1k',
			favoriteCount: '1.6k',
			successRate: '89%',
			feedbackCount: '102',
			brief: '适合 30~60 秒短视频口播，含开场钩子、核心内容和结尾引导。',
			useScenes: ['抖音口播', '小红书视频', '知识分享', '产品种草'],
			images: ['https://picsum.photos/seed/skill5a/600/400', 'https://picsum.photos/seed/skill5b/600/400', 'https://picsum.photos/seed/skill5c/600/400'],
			avgInputToken: '0.8k',
			avgOutputToken: '1.0k',
			avgTotalToken: '1.8k',
			estimatedCost: '¥0.02~0.06',
			recommendedModel: 'Claude Sonnet',
			commonModel: 'GPT-4o',
			showConsume: true,
			totalUses: '1,744',
			weekUses: '433',
			fullPrompt: `【你是谁】
你是一位短视频编导，擅长把一个主题快速整理成有节奏的口播脚本。

【你要做什么】
输出 30~60 秒口播稿，必须包含：
1. 开场 3 秒钩子
2. 中段核心观点（2~3点）
3. 结尾互动引导

【写作要求】
1. 句子短，口语化，读出来顺口
2. 每段不超过 2 行
3. 不要空泛鸡汤，要有具体信息

【固定参数（默认执行）】
- 默认时长：45秒
- 默认结构：开场钩子(3秒) + 3个观点 + 结尾引导
- 默认语速：每句不超过 18 字
- 若缺内容角度：默认“干货+案例”风格
- 禁止先提问，直接输出口播稿

【我会提供这些信息】
视频主题：{视频主题}
目标人群：{目标人群}
内容角度：{内容角度}
语气风格：{语气风格}
时长要求：{时长要求}`,
			variables: [
				{ name: '视频主题', desc: '这条视频讲什么' },
				{ name: '目标人群', desc: '希望打动谁' },
				{ name: '内容角度', desc: '故事型/干货型/测评型等' },
				{ name: '语气风格', desc: '热情/冷静/幽默等' },
				{ name: '时长要求', desc: '如30秒、45秒、60秒' }
			],
			variableNotes: '',
			steps: ['填变量', '生成3版脚本', '挑1版口播试拍', '按完播率再改开场钩子'],
			feedbacks: [
				{ id: 's5-f1', userName: '阿欣', userColor: '#9A6530', time: '6天前', model: 'Claude Sonnet', inputToken: '0.8k', outputToken: '1.1k', totalToken: '1.9k', status: 'normal', comment: '框架很好用，开场钩子我自己再改一下效果更好。' }
			],
			similarSkills: [
				{ id: 's4', title: '电商主图卖点文案生成器', tag: '电商', avgToken: '1.5k', successRate: '91%' },
				{ id: 's1', title: 'PS 人像精修提示词（参数版）', tag: '设计', avgToken: '1.9k', successRate: '93%' },
				{ id: 's6', title: '英语口语陪练教练', tag: '学习', avgToken: '1.6k', successRate: '88%' }
			]
		},
		s6: {
			id: 's6',
			title: '英语口语陪练教练',
			scene: '学习',
			author: '陈可',
			authorColor: '#2F8A57',
			publishTime: '2026-03-09',
			copyCount: '4.4k',
			favoriteCount: '1.3k',
			successRate: '88%',
			feedbackCount: '88',
			brief: '按真实对话场景做英语口语训练，先纠错再给更自然表达。',
			useScenes: ['面试英语', '出国旅行', '商务会议', '日常口语'],
			images: ['https://picsum.photos/seed/skill6a/600/400', 'https://picsum.photos/seed/skill6b/600/400'],
			avgInputToken: '0.9k',
			avgOutputToken: '0.7k',
			avgTotalToken: '1.6k',
			estimatedCost: '¥0.02~0.05',
			recommendedModel: 'GPT-4o',
			commonModel: 'GPT-4o-mini',
			showConsume: true,
			totalUses: '1,508',
			weekUses: '366',
			fullPrompt: `【你是谁】
你是一位英语口语教练，风格严格但鼓励，重点纠正“能听懂但不会说”的问题。

【你要做什么】
我给你中文或英文表达后，你按下面流程回答：
1. 先给更自然的英文表达
2. 再解释为什么这样说更地道
3. 最后给 2 句可替换说法

【要求】
1. 用简单好记的表达，不要过于书面
2. 每次只纠正 1~2 个关键点，避免信息过载
3. 如果我说“继续练习”，请自动出下一题

【固定参数（默认执行）】
- 每轮输出：改写句 + 解释 + 2句替换说法
- 词汇级别默认：CEFR B1
- 语气默认：礼貌自然、不过分正式
- 若缺练习场景：默认“日常沟通”
- 禁止先提问，直接开始训练

【我会提供这些信息】
练习场景：{练习场景}
我的原句：{我的原句}
我的水平：{我的水平}`,
			variables: [
				{ name: '练习场景', desc: '如“面试自我介绍”' },
				{ name: '我的原句', desc: '你想表达的话' },
				{ name: '我的水平', desc: '如“初级/中级”' }
			],
			variableNotes: '',
			steps: ['复制 Skill', '输入场景和原句', '跟读并复述改写句', '说“继续练习”进入下一轮'],
			feedbacks: [
				{ id: 's6-f1', userName: '小溪', userColor: '#7B5B3C', time: '1周前', model: 'GPT-4o', inputToken: '0.9k', outputToken: '0.7k', totalToken: '1.6k', status: 'success', comment: '解释很清楚，能马上用到口语里。' }
			],
			similarSkills: [
				{ id: 's5', title: '短视频口播脚本生成器', tag: '自媒体', avgToken: '1.8k', successRate: '89%' },
				{ id: 's3', title: '会议纪要行动项提取器', tag: '办公', avgToken: '1.2k', successRate: '93%' },
				{ id: 's2', title: '前端 Bug 定位与修复助手', tag: '编程', avgToken: '2.1k', successRate: '90%' }
			]
		}
	}

	const cloneSkill = (id: string) => {
		const source = SKILL_LIBRARY[id] || SKILL_LIBRARY.s1
		return JSON.parse(JSON.stringify(source))
	}

	const skill = ref(cloneSkill('s1'))

	const promptHtmlNodes = computed(() => {
		const html = `${skill.value.fullPromptHtml || ''}`.trim()
		return html || ''
	})

	const variableNotesText = computed(() => {
		const direct = `${skill.value.variableNotes || ''}`.trim()
		if (direct) return direct
		if (!Array.isArray(skill.value.variables) || !skill.value.variables.length) return ''
		return skill.value.variables
			.map((item: any) => `{${item.name}}：${item.desc}`)
			.join('\n')
	})

	const statusLabel = (status: string) => {
		return { success: '成功', normal: '一般', fail: '翻车' }[status] || status
	}

	const copySkill = () => {
		showCopyGuide.value = true
	}

	const copyAll = () => {
		uni.setClipboardData({
			data: skill.value.fullPrompt,
			success: () => uni.showToast({ title: '已复制全部内容', icon: 'success' })
		})
	}

	const previewSkillImage = (images: string[], idx: number) => {
		if (!images || !images.length) return
		uni.previewImage({ current: images[idx] || images[0], urls: images })
	}

	const previewContentImage = (idx: number) => {
		const images = Array.isArray(skill.value.contentImages) ? skill.value.contentImages.filter((item: any) => !!item) : []
		if (!images.length) return
		uni.previewImage({
			current: images[idx] || images[0],
			urls: images
		})
	}

	const applyPublishedSkill = (payload: any) => {
		if (!payload || typeof payload !== 'object') return
		skill.value = {
			...skill.value,
			id: payload.id ?? skill.value.id,
			title: payload.title ?? skill.value.title,
			scene: payload.scene ?? skill.value.scene,
			author: payload.author ?? skill.value.author,
			authorColor: payload.authorColor ?? skill.value.authorColor,
			publishTime: payload.publishTime ?? skill.value.publishTime,
			copyCount: payload.copyCount ?? skill.value.copyCount,
			favoriteCount: payload.favoriteCount ?? skill.value.favoriteCount,
			successRate: payload.successRate ?? skill.value.successRate,
				feedbackCount: payload.feedbackCount ?? skill.value.feedbackCount,
				brief: payload.brief ?? skill.value.brief,
				useScenes: Array.isArray(payload.useScenes) && payload.useScenes.length ? payload.useScenes : skill.value.useScenes,
				images: Array.isArray(payload.images) ? payload.images.slice(0, 9) : (skill.value.images || []),
				fullPrompt: payload.fullPrompt ?? skill.value.fullPrompt,
				fullPromptHtml: payload.fullPromptHtml ?? skill.value.fullPromptHtml,
				contentImages: Array.isArray(payload.contentImages) ? payload.contentImages.slice(0, 9) : (skill.value.contentImages || []),
				variableNotes: payload.variableNotes ?? skill.value.variableNotes,
				variables: Array.isArray(payload.variables) && payload.variables.length ? payload.variables : skill.value.variables,
				steps: Array.isArray(payload.steps) && payload.steps.length ? payload.steps : skill.value.steps,
				feedbacks: Array.isArray(payload.feedbacks) ? payload.feedbacks : skill.value.feedbacks,
				similarSkills: Array.isArray(payload.similarSkills) ? payload.similarSkills : skill.value.similarSkills
			}
		}

	onLoad((query: any) => {
		const isFromPublish = `${query?.fromPublish || ''}` === '1'
		if (isFromPublish) {
			const payload = uni.getStorageSync(PUBLISHED_SKILL_PREVIEW_KEY)
			if (!payload) return
			applyPublishedSkill(payload)
			uni.showToast({ title: '已加载刚发布内容', icon: 'none' })
			return
		}

		const skillId = `${query?.id || 's1'}`
		skill.value = cloneSkill(skillId)
	})

	const toggleFavorite = () => {
		isFavorited.value = !isFavorited.value
		uni.showToast({ title: isFavorited.value ? '已收藏' : '已取消收藏', icon: 'none' })
	}

	const followAuthor = () => {
		uni.showToast({ title: '已关注', icon: 'success' })
	}

	const shareSkill = () => {
		uni.showToast({ title: '分享功能开发中', icon: 'none' })
	}

	const reportSkill = () => {
		uni.showToast({ title: '举报功能开发中', icon: 'none' })
	}

	const writeFeedback = () => {
		uni.showToast({ title: '反馈功能开发中', icon: 'none' })
	}

	const toSkill = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}

	const copyQuick = (_s: any) => {
		uni.showToast({ title: '已复制 Skill', icon: 'success' })
	}

	const goBack = () => {
		uni.navigateBack()
	}

	const goUse = () => {
		showCopyGuide.value = false
		uni.showToast({ title: '打开你的 AI 工具使用吧', icon: 'none' })
	}

	const saveFavorite = () => {
		isFavorited.value = true
		showCopyGuide.value = false
		uni.showToast({ title: '已收藏到我的 Skill', icon: 'success' })
	}

	const recordResult = () => {
		showCopyGuide.value = false
		uni.switchTab({ url: '/pages/publish/index' })
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #FFFFFF;
	}

	/* 自定义导航栏 */
	.navbar {
		background: #FFFFFF;
		flex-shrink: 0;
		border-bottom: 1rpx solid rgba(0,0,0,0.05);

		.navbar-inner {
			height: 88rpx;
			padding: 0 24rpx;
			display: flex;
			align-items: center;
			gap: 16rpx;
		}

		.nav-back {
			width: 64rpx;
			height: 64rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(0,0,0,0.06);
			border-radius: 20rpx;
			flex-shrink: 0;

			.nav-back-icon {
				width: 32rpx;
				height: 32rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.nav-title {
			flex: 1;
			font-size: 30rpx;
			font-weight: 700;
			color: #1A1A1A;
			text-align: center;
		}

		.nav-actions {
			display: flex;
			gap: 8rpx;

			.nav-btn {
				width: 64rpx;
				height: 64rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				.nav-btn-icon {
					width: 30rpx;
					height: 30rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}
	}

	.main-scroll { flex: 1; overflow: hidden; }

	/* 通用 section 卡 */
	.section-card {
		margin: 20rpx 24rpx 0;
		background: #FFFFFF;
		border-radius: 28rpx;
		border: 1rpx solid rgba(0,0,0,0.07);
		padding: 28rpx;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 24rpx;

		.section-badge {
			width: 32rpx;
			height: 32rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}
		.section-title { font-size: 28rpx; font-weight: 700; color: #1A1A1A; flex: 1; }
		.section-subtitle { font-size: 20rpx; color: rgba(0,0,0,0.35); }
	}

	.copy-all-btn {
		height: 52rpx;
		padding: 0 18rpx;
		border-radius: 999rpx;
		background: rgba(228, 92, 26, 0.1);
		border: 1rpx solid rgba(228, 92, 26, 0.16);
		display: flex;
		align-items: center;
		gap: 6rpx;
		justify-content: center;

		.copy-all-icon {
			width: 20rpx;
			height: 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}

		.copy-all-text {
			font-size: 20rpx;
			color: #E45C1A;
			font-weight: 600;
		}
	}

	/* 2. 简介与场景 */
	.skill-intro {
		margin: 20rpx 24rpx 0;
		background: #FFFFFF;
		border: 1rpx solid rgba(228, 92, 26, 0.14);
		border-radius: 24rpx;
		padding: 24rpx;
		box-shadow: 0 10rpx 30rpx rgba(228, 92, 26, 0.08);

		.si-title {
			display: block;
			font-size: 24rpx;
			font-weight: 700;
			color: #B74914;
			margin-bottom: 12rpx;
		}

		.si-text {
			display: block;
			font-size: 25rpx;
			color: rgba(0,0,0,0.74);
			line-height: 1.72;
		}
	}

	.scene-block {
		margin: 12rpx 24rpx 0;
		background: #FFFFFF;
		border: 1rpx solid rgba(228, 92, 26, 0.1);
		border-radius: 24rpx;
		padding: 24rpx 24rpx 20rpx;

		.sb-title {
			display: block;
			font-size: 24rpx;
			font-weight: 700;
			color: #B74914;
			margin-bottom: 14rpx;
		}

		.scene-chip-list {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
		}

		.scene-chip {
			height: 52rpx;
			padding: 0 18rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(228, 92, 26, 0.08);
			border: 1rpx solid rgba(228, 92, 26, 0.18);
			border-radius: 999rpx;

			.scene-chip-text {
				font-size: 22rpx;
				color: #C24F16;
				font-weight: 600;
				line-height: 1;
			}
		}
	}

	/* 1. 顶部概览区 */
	.overview-section {
		margin: 20rpx 24rpx 0;
		background: #FFFFFF;
		border-radius: 28rpx;
		border: 1rpx solid rgba(0,0,0,0.07);
		padding: 28rpx;

		.scene-tag {
			display: inline-flex;
			font-size: 20rpx;
			color: rgba(0,0,0,0.50);
			background: rgba(0,0,0,0.07);
			padding: 6rpx 18rpx;
			border-radius: 100rpx;
			margin-bottom: 18rpx;
		}

		.skill-title {
			display: block;
			font-size: 38rpx;
			font-weight: 900;
			color: #1A1A1A;
			line-height: 1.3;
			margin-bottom: 24rpx;
			letter-spacing: -0.5rpx;
		}

		.author-row {
			display: flex;
			align-items: center;
			gap: 12rpx;
			margin-bottom: 28rpx;

			.author-av {
				width: 56rpx;
				height: 56rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.author-av-t { font-size: 22rpx; color: #fff; font-weight: 700; }
			}

			.author-name { font-size: 26rpx; color: rgba(0,0,0,0.8); font-weight: 600; }
			.publish-time { font-size: 22rpx; color: rgba(0,0,0,0.40); flex: 1; }

			.follow-btn {
				background: rgba(228, 92, 26,0.15);
				border: 1rpx solid rgba(228, 92, 26, 0.2);
				padding: 10rpx 24rpx;
				border-radius: 100rpx;

				.follow-btn-text { font-size: 22rpx; color: #E45C1A; font-weight: 600; }
			}
		}

		.overview-stats {
			display: flex;
			align-items: center;
			background: rgba(0,0,0,0.03);
			border-radius: 20rpx;
			padding: 20rpx 0;

			.ov-stat {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 6rpx;

				.ov-stat-val { font-size: 28rpx; font-weight: 800; color: #1A1A1A; }
				.ov-stat-val.green { color: #2F8A57; }
				.ov-stat-label { font-size: 20rpx; color: rgba(0,0,0,0.40); }
			}

			.ov-divider {
				width: 1rpx;
				height: 36rpx;
				background: rgba(0,0,0,0.08);
			}
		}
	}

	/* 图片九宫格 */
	.skill-imgs {
		display: flex;
		flex-wrap: wrap;
		gap: 4rpx;
		margin-top: 16rpx;

		.skill-img { border-radius: 10rpx; display: block; }

		/* 1张：宽横图 */
		&.gi-1 .skill-img { width: 100%; height: 360rpx; border-radius: 16rpx; }
		/* 2张：并排各半 */
		&.gi-2 .skill-img { width: calc(50% - 2rpx); height: 240rpx; }
		/* 3张：三等分一行 */
		&.gi-3 .skill-img { width: calc(33.33% - 3rpx); height: 200rpx; }
		/* 4张：2×2 方格 */
		&.gi-4 .skill-img { width: calc(50% - 2rpx); height: 220rpx; }
		/* 5-9张：每行3列自然换行，末行左对齐 */
		&.gi-many .skill-img { width: calc(33.33% - 3rpx); height: 190rpx; }
	}


		/* 4. Skill 正文区 */
		.skill-content-card {
			padding-top: 20rpx;

			.section-header {
				margin-bottom: 18rpx;
			}

			.skill-content-panel {
				background: #191A31;
				border-radius: 26rpx;
				padding: 28rpx;
				border: 1rpx solid rgba(255,255,255,0.06);
			}

			.scp-text,
			.scp-rich {
				display: block;
				font-size: 24rpx;
				color: #AEB7FF;
				line-height: 1.72;
				white-space: pre-wrap;
				word-break: break-word;
			}

			.scp-rich :deep(img) {
				max-width: 100%;
				height: auto;
				border-radius: 10rpx;
			}

			.content-img-block {
				margin-top: 18rpx;
			}

			.content-img-title {
				display: block;
				margin-bottom: 10rpx;
				font-size: 22rpx;
				font-weight: 700;
				color: rgba(0, 0, 0, 0.60);
			}

			.content-img-grid {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 10rpx;
			}

			.content-img {
				width: 100%;
				height: 168rpx;
				border-radius: 12rpx;
				background: rgba(0, 0, 0, 0.04);
			}
		}

	.variable-notes-card {
		.vn-text {
			display: block;
			font-size: 24rpx;
			color: rgba(0, 0, 0, 0.72);
			line-height: 1.7;
			white-space: pre-wrap;
			word-break: break-word;
		}
	}

	/* 5. 使用步骤 */
	.steps-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.step-item {
			display: flex;
			gap: 16rpx;
			align-items: flex-start;

			.step-num {
				width: 48rpx;
				height: 48rpx;
				border-radius: 50%;
				background: #E45C1A;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				margin-top: 4rpx;

				.step-num-text { font-size: 22rpx; color: #fff; font-weight: 800; }
			}

			.step-text { font-size: 26rpx; color: rgba(0,0,0,0.75); line-height: 1.65; flex: 1; }
		}
	}

	/* 6. 复现反馈区 */
	.write-feedback-btn {
		background: rgba(228, 92, 26,0.12);
		border: 1rpx solid rgba(228, 92, 26, 0.16);
		padding: 8rpx 20rpx;
		border-radius: 100rpx;

		.write-fb-text { font-size: 22rpx; color: #E45C1A; font-weight: 600; }
	}

	.feedback-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;

		.feedback-card {
			background: rgba(0,0,0,0.03);
			border-radius: 20rpx;
			padding: 20rpx;

			.fb-head {
				display: flex;
				align-items: center;
				gap: 12rpx;
				margin-bottom: 16rpx;

				.fb-av {
					width: 52rpx;
					height: 52rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;

					.fb-av-t { font-size: 20rpx; color: #fff; font-weight: 700; }
				}

				.fb-meta {
					flex: 1;

					.fb-name { display: block; font-size: 24rpx; font-weight: 600; color: rgba(0,0,0,0.8); }
					.fb-time { font-size: 20rpx; color: rgba(0,0,0,0.40); }
				}

				.fb-status-badge {
					font-size: 20rpx;
					padding: 6rpx 14rpx;
					border-radius: 100rpx;

					&.status-success { color: #2F8A57; background: rgba(47, 138, 87,0.12); }
					&.status-normal { color: #5E738A; background: rgba(94, 115, 138,0.12); }
					&.status-fail { color: #C84634; background: rgba(200, 70, 52,0.12); }

					.fb-status-text { font-weight: 600; }
				}
			}

			.fb-token-row {
				display: flex;
				gap: 0;
				background: rgba(0,0,0,0.03);
				border-radius: 12rpx;
				padding: 12rpx 0;
				margin-bottom: 16rpx;

				.fbt-item {
					flex: 1;
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4rpx;

					.fbt-label { font-size: 18rpx; color: rgba(0,0,0,0.35); }
					.fbt-val { font-size: 22rpx; font-weight: 700; color: rgba(0,0,0,0.70); }
					.fbt-val.orange { color: #E45C1A; }
					.fbt-val.model { font-size: 20rpx; color: #C7A06A; }
				}
			}

			.fb-comment {
				font-size: 24rpx;
				color: rgba(0,0,0,0.70);
				line-height: 1.65;
			}
		}
	}

	/* 7. 相似推荐 */
	.similar-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.similar-item {
			display: flex;
			align-items: center;
			gap: 20rpx;
			padding: 18rpx 0;
			border-bottom: 1rpx solid rgba(0,0,0,0.05);

			&:last-child { border-bottom: none; }

			.si-info {
				flex: 1;

				.si-tag {
					display: inline-flex;
					font-size: 18rpx;
					color: rgba(0,0,0,0.40);
					background: rgba(0,0,0,0.06);
					padding: 3rpx 12rpx;
					border-radius: 6rpx;
					margin-bottom: 8rpx;
				}

				.si-title { display: block; font-size: 26rpx; font-weight: 700; color: #1A1A1A; margin-bottom: 8rpx; }

				.si-meta {
					display: flex;
					gap: 16rpx;

					.si-token-wrap {
						display: flex;
						align-items: center;
						gap: 4rpx;
					}

					.si-token { font-size: 22rpx; }
					.orange { color: #E45C1A; }
					.si-rate { font-size: 22rpx; }
					.green { color: #2F8A57; }
				}
			}

			.si-copy-btn {
				background: rgba(228, 92, 26,0.12);
				border: 1rpx solid rgba(228, 92, 26, 0.16);
				padding: 12rpx 24rpx;
				border-radius: 100rpx;
				flex-shrink: 0;

				.si-copy-text { font-size: 22rpx; color: #E45C1A; font-weight: 600; }
			}
		}
	}

	.detail-bottom { height: calc(180rpx + env(safe-area-inset-bottom)); }

	/* 底部固定操作栏 */
	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		background: #FFFFFF;
		backdrop-filter: blur(12px);
		border-top: 1rpx solid rgba(0,0,0,0.07);
		display: flex;
		gap: 16rpx;
		align-items: center;

		.bb-fav {
			width: 96rpx;
			height: 88rpx;
			background: rgba(0,0,0,0.06);
			border-radius: 24rpx;
			border: 1rpx solid rgba(0,0,0,0.09);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 4rpx;

			.bb-fav-icon {
				width: 30rpx;
				height: 30rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.bb-fav-text { font-size: 18rpx; color: rgba(0,0,0,0.50); }
		}

		.bb-copy-btn {
			flex: 1;
			height: 88rpx;
			background: #E45C1A;
			border-radius: 24rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			box-shadow: 0 8rpx 28rpx rgba(228, 92, 26, 0.24);

			.bb-copy-icon {
				width: 24rpx;
				height: 24rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
			}
			.bb-copy-text { font-size: 30rpx; font-weight: 700; color: #fff; }
		}
	}

	/* 复制成功引导 */
	.copy-guide-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0,0,0,0.7);
		z-index: 200;
		display: flex;
		align-items: flex-end;
	}

	.copy-guide-sheet {
		width: 100%;
		background: #FFFFFF;
		border-radius: 40rpx 40rpx 0 0;
		border-top: 1rpx solid rgba(0,0,0,0.08);
		padding: 40rpx 28rpx calc(48rpx + env(safe-area-inset-bottom));

		.cg-title-row {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8rpx;
			margin-bottom: 10rpx;
		}

		.cg-title {
			display: block;
			font-size: 34rpx;
			font-weight: 800;
			color: #1A1A1A;
			text-align: center;
		}

		.cg-subtitle {
			display: block;
			font-size: 24rpx;
			color: rgba(0,0,0,0.40);
			margin-bottom: 36rpx;
			text-align: center;
		}

		.cg-actions {
			display: flex;
			flex-direction: column;
			gap: 16rpx;

			.cg-btn {
				height: 96rpx;
				background: rgba(0,0,0,0.06);
				border-radius: 24rpx;
				border: 1rpx solid rgba(0,0,0,0.08);
				display: flex;
				align-items: center;
				gap: 20rpx;
				padding: 0 28rpx;

				&:first-child {
					background: rgba(228, 92, 26,0.12);
					border-color: rgba(228, 92, 26, 0.16);
				}

				.cg-btn-icon {
					width: 28rpx;
					height: 28rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}
				.cg-btn-text { font-size: 28rpx; font-weight: 600; color: rgba(0,0,0,0.85); }
			}
		}
	}
</style>
