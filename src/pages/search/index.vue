<template>
	<view class="page">

		<!-- 搜索输入行 -->
		<view class="search-bar">
			<view class="search-input-wrap">
				<text class="search-icon">🔍</text>
				<input
					v-model="keyword"
					class="search-input"
					placeholder="搜索内容、Skill、用户..."
					placeholder-class="search-ph"
					confirm-type="search"
					:focus="true"
					@confirm="doSearch"
					@input="onInput"
				/>
				<view v-if="keyword" class="clear-btn" @tap="clearSearch">
					<text class="clear-icon">✕</text>
				</view>
			</view>
			<text class="cancel-btn" @tap="goBack">取消</text>
		</view>

		<!-- 未搜索状态 -->
		<view v-if="!hasSearched" class="pre-search">

			<!-- 热门搜索 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">热门搜索</text>
					<text class="section-icon">🔥</text>
				</view>
				<view class="hot-tags">
					<view
						v-for="(term, i) in HOT_TERMS"
						:key="term"
						class="hot-tag"
						:class="{ 'hot-top': i < 3 }"
						@tap="searchTerm(term)"
					>
						<text class="hot-rank" v-if="i < 3">{{ i + 1 }}</text>
						<text class="hot-text">{{ term }}</text>
					</view>
				</view>
			</view>

			<!-- 最近搜索 -->
			<view v-if="recentSearches.length" class="section">
				<view class="section-header">
					<text class="section-title">最近搜索</text>
					<view class="clear-history-btn" @tap="clearHistory">
						<text class="clear-history-text">清空</text>
					</view>
				</view>
				<view class="recent-tags">
					<view
						v-for="term in recentSearches"
						:key="term"
						class="recent-tag"
						@tap="searchTerm(term)"
					>
						<text class="recent-icon">⏱</text>
						<text class="recent-text">{{ term }}</text>
					</view>
				</view>
			</view>

			<!-- 热门标签 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">热门标签</text>
				</view>
				<view class="label-tags">
					<view
						v-for="tag in HOT_TAGS"
						:key="tag"
						class="label-tag"
						@tap="searchTerm(tag)"
					>
						<text class="label-tag-text"># {{ tag }}</text>
					</view>
				</view>
			</view>

		</view>

		<!-- 搜索结果 -->
		<view v-else class="search-results">

			<!-- 结果 Tab -->
			<view class="result-tabs">
				<view
					v-for="tab in RESULT_TABS"
					:key="tab.key"
					class="rtab"
					:class="{ active: resultTab === tab.key }"
					@tap="resultTab = tab.key"
				>
					<text class="rtab-text">{{ tab.label }}</text>
					<view v-if="resultTab === tab.key" class="rtab-bar" />
				</view>
			</view>

			<!-- 结果列表 -->
			<scroll-view class="results-scroll" scroll-y :show-scrollbar="false">
				<view class="results-inner">

					<!-- 全部 / 社区 -->
					<view v-if="resultTab === 'all' || resultTab === 'posts'">
						<view v-for="post in searchPostResults" :key="post.id" class="result-post-card" @tap="toPost(post.id)">
							<view class="result-post-main">
								<view class="rp-info">
									<text class="rp-title">{{ post.title }}</text>
									<text class="rp-content line-2">{{ post.content }}</text>
									<view class="rp-foot">
										<view class="rp-av" :style="{ background: post.color }">
											<text class="rp-av-t">{{ post.author[0] }}</text>
										</view>
										<text class="rp-author">{{ post.author }}</text>
										<text class="rp-sep">·</text>
										<text class="rp-likes">♥ {{ post.likes }}</text>
									</view>
								</view>
								<image v-if="post.cover" :src="post.cover" class="rp-cover" mode="aspectFill" lazy-load />
							</view>
						</view>
					</view>

					<!-- 全部 / Skill -->
					<view v-if="resultTab === 'all' || resultTab === 'skills'">
						<view v-if="resultTab === 'all'" class="result-section-title">
							<text>Skill</text>
						</view>
						<view v-for="skill in searchSkillResults" :key="skill.id" class="result-skill-card" @tap="toSkill(skill.id)">
							<view class="rsk-icon">
								<text class="rsk-emoji">{{ skill.icon }}</text>
							</view>
							<view class="rsk-info">
								<text class="rsk-title">{{ skill.title }}</text>
								<text class="rsk-desc line-1">{{ skill.desc }}</text>
								<view class="rsk-tags">
									<text v-for="tag in skill.tags" :key="tag" class="rsk-tag">{{ tag }}</text>
								</view>
							</view>
							<view class="rsk-use-btn" @tap.stop="useSkill(skill)">
								<text class="rsk-use-text">使用</text>
							</view>
						</view>
					</view>

					<view class="results-bottom" />
				</view>
			</scroll-view>
		</view>

	</view>
</template>

<script setup lang="ts">
	const HOT_TERMS = ['AI写作', '周报生成', '文案技巧', '效率工具', '副业变现', 'ChatGPT', '面试技巧', '设计灵感', 'Notion模板', '职场沟通']
	const HOT_TAGS = ['AI写作', '效率提升', '副业', '设计', '职场', '编程', '学习方法', '创作']
	const RESULT_TABS = [
		{ key: 'all', label: '全部' },
		{ key: 'posts', label: '社区' },
		{ key: 'skills', label: 'Skill' }
	]

	const keyword = ref('')
	const hasSearched = ref(false)
	const resultTab = ref('all')
	const recentSearches = ref(['AI文案', '周报模板', '设计工具'])

	const onInput = () => {
		// 实时搜索逻辑预留
	}

	const doSearch = () => {
		if (!keyword.value.trim()) return
		if (!recentSearches.value.includes(keyword.value)) {
			recentSearches.value.unshift(keyword.value)
			if (recentSearches.value.length > 8) recentSearches.value.pop()
		}
		hasSearched.value = true
		resultTab.value = 'all'
	}

	const searchTerm = (term: string) => {
		keyword.value = term
		doSearch()
	}

	const clearSearch = () => {
		keyword.value = ''
		hasSearched.value = false
	}

	const clearHistory = () => {
		recentSearches.value = []
	}

	const searchPostResults = ref([
		{
			id: 'sp1', author: '林晓珊', color: '#7C3AED',
			cover: 'https://picsum.photos/seed/sr1/200/200',
			title: '用 AI 写出了让甲方满意的文案',
			content: '昨天用 Skill 广场里的「甲方文案生成」试了一下，效果出乎意料地好...',
			likes: 238
		},
		{
			id: 'sp2', author: '高远', color: '#7C3AED',
			cover: 'https://picsum.photos/seed/sr2/200/200',
			title: '用这个 Prompt 写出了10W+ 文章',
			content: '最近在研究如何用 AI 辅助写作，这个 Prompt 框架真的让我的写作速度提升了3倍...',
			likes: 1204
		},
		{
			id: 'sp3', author: '周雯雯', color: '#BE185D',
			cover: null,
			title: null,
			content: '刚刚发现一个宝藏工具！可以一键把文章转成小红书格式，再也不用手动排版了...',
			likes: 445
		}
	])

	const searchSkillResults = ref([
		{ id: 's1', icon: '✍️', title: '万能文案生成器', desc: '30秒输出3套方案，格式全覆盖', tags: ['文案', '营销'] },
		{ id: 's2', icon: '📝', title: '周报一键生成', desc: '帮你生成让领导满意的专业周报', tags: ['职场', '效率'] },
		{ id: 's3', icon: '📱', title: '小红书爆款标题生成', desc: '批量生成高点击标题，告别标题焦虑', tags: ['写作', '小红书'] }
	])

	const useSkill = (_skill: any) => {
		uni.showToast({ title: '已复制 Skill 内容', icon: 'success' })
	}

	const toPost = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/post?id=${id}` })
	}

	const toSkill = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}

	const goBack = () => {
		uni.navigateBack()
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #F7F8FA;
	}

	/* 搜索栏 */
	.search-bar {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 16rpx 24rpx;
		background: #fff;
		border-bottom: 1rpx solid #F3F4F6;
		flex-shrink: 0;

		.search-input-wrap {
			flex: 1;
			display: flex;
			align-items: center;
			background: #F3F4F6;
			border-radius: 20rpx;
			padding: 16rpx 20rpx;
			gap: 12rpx;

			.search-icon {
				font-size: 28rpx;
				flex-shrink: 0;
			}

			.search-input {
				flex: 1;
				font-size: 28rpx;
				color: #1A1A2E;
				height: 40rpx;
				line-height: 40rpx;
			}

			.clear-btn {
				.clear-icon {
					font-size: 24rpx;
					color: #9CA3AF;
				}
			}
		}

		.cancel-btn {
			font-size: 28rpx;
			color: #5B5BD6;
			flex-shrink: 0;
		}
	}

	/* 未搜索状态 */
	.pre-search {
		padding: 24rpx;

		.section {
			margin-bottom: 32rpx;

			.section-header {
				display: flex;
				align-items: center;
				gap: 8rpx;
				margin-bottom: 16rpx;

				.section-title {
					font-size: 28rpx;
					font-weight: 700;
					color: #1A1A2E;
				}

				.section-icon {
					font-size: 26rpx;
				}

				.clear-history-btn {
					margin-left: auto;

					.clear-history-text {
						font-size: 24rpx;
						color: #9CA3AF;
					}
				}
			}
		}

		.hot-tags {
			display: flex;
			flex-direction: column;
			gap: 0;

			.hot-tag {
				display: flex;
				align-items: center;
				gap: 16rpx;
				padding: 18rpx 0;
				border-bottom: 1rpx solid #F3F4F6;

				.hot-rank {
					width: 40rpx;
					font-size: 28rpx;
					font-weight: 700;
					color: #EF4444;
					text-align: center;
				}

				.hot-text {
					font-size: 28rpx;
					color: #1A1A2E;
				}

				&:not(.hot-top) .hot-rank {
					display: none;
				}

				&:not(.hot-top) {
					padding-left: 56rpx;
				}
			}
		}

		.recent-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;

			.recent-tag {
				display: flex;
				align-items: center;
				gap: 8rpx;
				background: #fff;
				border-radius: 40rpx;
				padding: 12rpx 20rpx;
				border: 1rpx solid #E5E7EB;

				.recent-icon {
					font-size: 22rpx;
				}

				.recent-text {
					font-size: 24rpx;
					color: #6B7280;
				}
			}
		}

		.label-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;

			.label-tag {
				background: rgba(91, 91, 214, 0.08);
				border-radius: 40rpx;
				padding: 12rpx 24rpx;

				.label-tag-text {
					font-size: 24rpx;
					color: #5B5BD6;
					font-weight: 500;
				}
			}
		}
	}

	/* 搜索结果 */
	.search-results {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;

		.result-tabs {
			display: flex;
			background: #fff;
			padding: 0 20rpx;
			border-bottom: 1rpx solid #F3F4F6;
			flex-shrink: 0;

			.rtab {
				position: relative;
				padding: 20rpx 20rpx 18rpx;

				.rtab-text {
					font-size: 28rpx;
					color: #9CA3AF;
				}

				&.active .rtab-text {
					color: #1A1A2E;
					font-weight: 700;
				}

				.rtab-bar {
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 32rpx;
					height: 4rpx;
					border-radius: 2rpx;
					background: #5B5BD6;
				}
			}
		}

		.results-scroll {
			flex: 1;
			overflow: hidden;

			.results-inner {
				padding: 16rpx 20rpx;
			}

			.results-bottom {
				height: 40rpx;
			}
		}
	}

	.result-section-title {
		font-size: 26rpx;
		font-weight: 700;
		color: #9CA3AF;
		padding: 8rpx 0 12rpx;
		border-bottom: 1rpx solid #F3F4F6;
		margin-bottom: 12rpx;
	}

	/* 帖子结果卡片 */
	.result-post-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 12rpx;
		box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.04);

		.result-post-main {
			display: flex;
			gap: 16rpx;

			.rp-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 8rpx;

				.rp-title {
					font-size: 28rpx;
					font-weight: 700;
					color: #1A1A2E;
				}

				.rp-content {
					font-size: 24rpx;
					color: #6B7280;
					line-height: 1.6;
				}

				.rp-foot {
					display: flex;
					align-items: center;
					gap: 8rpx;
					margin-top: 4rpx;

					.rp-av {
						width: 36rpx;
						height: 36rpx;
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;

						.rp-av-t {
							font-size: 14rpx;
							color: #fff;
							font-weight: 700;
						}
					}

					.rp-author {
						font-size: 22rpx;
						color: #9CA3AF;
					}

					.rp-sep {
						font-size: 22rpx;
						color: #D1D5DB;
					}

					.rp-likes {
						font-size: 22rpx;
						color: #9CA3AF;
					}
				}
			}

			.rp-cover {
				width: 160rpx;
				height: 120rpx;
				border-radius: 12rpx;
				flex-shrink: 0;
			}
		}
	}

	/* Skill 结果卡片 */
	.result-skill-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 12rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.04);

		.rsk-icon {
			width: 80rpx;
			height: 80rpx;
			background: #F0F0FD;
			border-radius: 18rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			.rsk-emoji {
				font-size: 40rpx;
			}
		}

		.rsk-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 6rpx;

			.rsk-title {
				font-size: 28rpx;
				font-weight: 700;
				color: #1A1A2E;
			}

			.rsk-desc {
				font-size: 22rpx;
				color: #9CA3AF;
			}

			.rsk-tags {
				display: flex;
				gap: 8rpx;

				.rsk-tag {
					font-size: 20rpx;
					color: #5B5BD6;
					background: rgba(91, 91, 214, 0.08);
					padding: 3rpx 12rpx;
					border-radius: 10rpx;
				}
			}
		}

		.rsk-use-btn {
			background: #5B5BD6;
			padding: 12rpx 24rpx;
			border-radius: 30rpx;
			flex-shrink: 0;

			.rsk-use-text {
				font-size: 22rpx;
				color: #fff;
				font-weight: 500;
			}
		}
	}
</style>
