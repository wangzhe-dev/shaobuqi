<template>
	<view class="page">

		<!-- 封面 + 头像区 -->
		<view class="profile-hero" :style="{ paddingTop: statusBarHeight + 'px' }">

			<!-- 返回按钮 -->
			<view class="back-btn" @tap="goBack">
				<text class="back-icon">‹</text>
			</view>

			<!-- 封面图 -->
			<image src="https://picsum.photos/seed/authorcover/750/400" class="cover-bg" mode="aspectFill" />

			<!-- 头像 + 关注按钮 -->
			<view class="hero-bottom">
				<view class="av-wrap">
					<view class="av" :style="{ background: author.color }">
						<text class="av-t">{{ author.name[0] }}</text>
					</view>
				</view>
				<view class="follow-action" @tap="toggleFollow">
					<view class="follow-btn" :class="{ following: isFollowing }">
						<text class="follow-text">{{ isFollowing ? '✓ 已关注' : '+ 关注' }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 用户信息 -->
		<view class="user-info">
			<text class="user-name">{{ author.name }}</text>
			<text class="user-bio">{{ author.bio }}</text>
			<view class="user-tags">
				<uni-tag
					v-for="tag in author.tags"
					:key="tag"
					class="user-tag-ui"
					:text="tag"
					type="primary"
					size="mini"
					circle
					inverted
				/>
			</view>
		</view>

		<!-- 数据统计 -->
		<view class="stats-row">
			<view class="stat-item">
				<text class="stat-n">{{ author.posts }}</text>
				<text class="stat-l">发布</text>
			</view>
			<view class="stat-div" />
			<view class="stat-item">
				<text class="stat-n">{{ author.followers }}</text>
				<text class="stat-l">粉丝</text>
			</view>
			<view class="stat-div" />
			<view class="stat-item">
				<text class="stat-n">{{ author.skills }}</text>
				<text class="stat-l">Skill</text>
			</view>
			<view class="stat-div" />
			<view class="stat-item">
				<text class="stat-n">{{ author.totalLikes }}</text>
				<text class="stat-l">获赞</text>
			</view>
		</view>

		<!-- 内容 Tab -->
		<view class="content-tabs">
			<uni-segmented-control
				:current="activeTabIndex"
				:values="tabValues"
				style-type="text"
				active-color="#5B5BD6"
				@clickItem="onContentTabChange"
			/>
		</view>

		<!-- 内容列表 -->
		<scroll-view class="content-scroll" scroll-y :show-scrollbar="false">

			<!-- 帖子 Grid -->
			<view v-if="activeTab === 'posts'" class="posts-grid">
				<view
					v-for="post in authorPosts"
					:key="post.id"
					class="grid-cell"
					@tap="toPost(post.id)"
				>
					<image v-if="post.cover" :src="post.cover" class="grid-img" mode="aspectFill" />
					<view v-else class="grid-text-bg">
						<text class="grid-text line-4">{{ post.content }}</text>
					</view>
					<view class="grid-overlay">
						<text class="grid-likes">♥ {{ post.likes }}</text>
					</view>
				</view>
			</view>

			<!-- Skill 列表 -->
			<view v-else-if="activeTab === 'skills'" class="skills-list">
				<view
					v-for="skill in authorSkills"
					:key="skill.id"
					class="skill-mini-card"
					@tap="toSkill(skill.id)"
				>
					<view class="smc-icon">
						<text class="smc-emoji">{{ skill.icon }}</text>
					</view>
					<view class="smc-info">
						<text class="smc-title">{{ skill.title }}</text>
						<text class="smc-desc line-1">{{ skill.desc }}</text>
						<view class="smc-foot">
							<text class="smc-usage">使用 {{ skill.usage }}</text>
							<view class="smc-tags">
								<uni-tag
									v-for="tag in skill.tags"
									:key="tag"
									class="smc-tag-ui"
									:text="tag"
									type="primary"
									size="mini"
									circle
									inverted
								/>
							</view>
						</view>
					</view>
					<view class="smc-use-btn" @tap.stop="useSkill(skill)">
						<text class="smc-use-text">使用</text>
					</view>
				</view>
			</view>

			<view class="scroll-bottom" />
		</scroll-view>

	</view>
</template>

<script setup lang="ts">
	import { useSysInfoStore } from '@/stores'

	const sysInfo = useSysInfoStore()
	const statusBarHeight = computed(() => (sysInfo.systemInfo as any).statusBarHeight || 44)

	const TABS = [
		{ key: 'posts', label: '发布' },
		{ key: 'skills', label: 'Skill' }
	]

	const isFollowing = ref(false)
	const activeTab = ref('posts')
	const tabValues = TABS.map((tab) => tab.label)
	const activeTabIndex = computed(() => {
		const currentIndex = TABS.findIndex((tab) => tab.key === activeTab.value)
		return currentIndex === -1 ? 0 : currentIndex
	})

	const author = reactive({
		name: '文案大师Leon',
		color: '#5B5BD6',
		bio: '10年文案经验 · 服务500+品牌 · 专注帮小白写出有销售力的文案',
		tags: ['文案', '营销', 'AI工具'],
		posts: '36',
		followers: '12.4k',
		skills: '8',
		totalLikes: '24.8k'
	})

	const authorPosts = ref([
		{ id: 'ap1', cover: 'https://picsum.photos/seed/au1/400/400', content: '', likes: '238' },
		{ id: 'ap2', cover: 'https://picsum.photos/seed/au2/400/400', content: '', likes: '156' },
		{ id: 'ap3', cover: null, content: '关于文案的三个核心逻辑，学完之后你的文案会脱胎换骨...', likes: '892' },
		{ id: 'ap4', cover: 'https://picsum.photos/seed/au4/400/400', content: '', likes: '467' },
		{ id: 'ap5', cover: 'https://picsum.photos/seed/au5/400/400', content: '', likes: '543' },
		{ id: 'ap6', cover: null, content: '甲方说"文案太普通"，其实是因为你没踩到这个点...', likes: '1.2k' },
		{ id: 'ap7', cover: 'https://picsum.photos/seed/au7/400/400', content: '', likes: '334' },
		{ id: 'ap8', cover: 'https://picsum.photos/seed/au8/400/400', content: '', likes: '289' },
		{ id: 'ap9', cover: 'https://picsum.photos/seed/au9/400/400', content: '', likes: '712' }
	])

	const authorSkills = ref([
		{ id: 's1', icon: '✍️', title: '万能文案生成器', desc: '30秒输出3套方案，格式全覆盖', tags: ['文案', '营销'], usage: '2.3k' },
		{ id: 's2', icon: '📱', title: '小红书爆款标题生成', desc: '批量生成高点击标题，告别标题焦虑', tags: ['写作', '小红书'], usage: '1.8k' },
		{ id: 's3', icon: '🎯', title: '用户痛点挖掘框架', desc: '系统化挖掘目标用户的核心痛点', tags: ['文案', '用户研究'], usage: '956' },
		{ id: 's4', icon: '🔥', title: '朋友圈种草文模板', desc: '让朋友圈不像广告的卖货文案模板', tags: ['文案', '社交媒体'], usage: '3.4k' }
	])

	const toggleFollow = () => {
		isFollowing.value = !isFollowing.value
	}

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

	const onContentTabChange = (e: { currentIndex: number }) => {
		activeTab.value = TABS[e.currentIndex]?.key ?? TABS[0].key
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #F7F8FA;
	}

	/* 顶部 Hero */
	.profile-hero {
		position: relative;
		flex-shrink: 0;

		.back-btn {
			position: absolute;
			top: 0;
			left: 20rpx;
			z-index: 20;
			margin-top: 16rpx;
			width: 72rpx;
			height: 72rpx;
			border-radius: 50%;
			background: rgba(0, 0, 0, 0.3);
			display: flex;
			align-items: center;
			justify-content: center;

			.back-icon {
				font-size: 44rpx;
				color: #fff;
				font-weight: 300;
			}
		}

		.cover-bg {
			width: 100%;
			height: 300rpx;
			display: block;
		}

		.hero-bottom {
			display: flex;
			align-items: flex-end;
			justify-content: space-between;
			padding: 0 28rpx 20rpx;
			margin-top: -60rpx;

			.av-wrap {
				.av {
					width: 120rpx;
					height: 120rpx;
					border-radius: 50%;
					border: 4rpx solid #fff;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);

					.av-t {
						font-size: 48rpx;
						color: #fff;
						font-weight: 700;
					}
				}
			}

			.follow-btn {
				background: #5B5BD6;
				border-radius: 40rpx;
				padding: 18rpx 40rpx;

				.follow-text {
					font-size: 26rpx;
					color: #fff;
					font-weight: 600;
				}

				&.following {
					background: #F3F4F6;
					border: 1rpx solid #E5E7EB;

					.follow-text {
						color: #9CA3AF;
					}
				}
			}
		}
	}

	/* 用户信息 */
	.user-info {
		padding: 4rpx 28rpx 20rpx;
		background: #fff;

		.user-name {
			display: block;
			font-size: 36rpx;
			font-weight: 800;
			color: #1A1A2E;
			margin-bottom: 10rpx;
		}

		.user-bio {
			display: block;
			font-size: 24rpx;
			color: #6B7280;
			line-height: 1.6;
			margin-bottom: 14rpx;
		}

		.user-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
		}
	}

	/* 数据统计 */
	.stats-row {
		display: flex;
		align-items: center;
		background: #fff;
		border-top: 1rpx solid #F3F4F6;
		padding: 20rpx 0;
		margin-bottom: 16rpx;

		.stat-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 4rpx;

			.stat-n {
				font-size: 32rpx;
				font-weight: 700;
				color: #1A1A2E;
			}

			.stat-l {
				font-size: 22rpx;
				color: #9CA3AF;
			}
		}

		.stat-div {
			width: 1rpx;
			height: 48rpx;
			background: #E5E7EB;
		}
	}

	/* 内容 Tab */
	.content-tabs {
		background: #fff;
		padding: 8rpx 20rpx 10rpx;
		border-bottom: 1rpx solid #F3F4F6;
		flex-shrink: 0;

		:deep(.segmented-control) {
			height: auto;
		}

		:deep(.segmented-control__item) {
			padding: 10rpx 0;
		}

		:deep(.segmented-control__text) {
			font-size: 28rpx;
		}

		:deep(.segmented-control__item--text) {
			padding: 8rpx 0 14rpx;
		}
	}

	/* 内容 */
	.content-scroll {
		flex: 1;
		overflow: hidden;

		.scroll-bottom {
			height: 40rpx;
		}
	}

	/* 帖子 Grid */
	.posts-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 4rpx;
		padding: 4rpx;

		.grid-cell {
			width: calc(33.33% - 3rpx);
			height: 240rpx;
			position: relative;
			overflow: hidden;
			border-radius: 4rpx;

			.grid-img {
				width: 100%;
				height: 100%;
			}

			.grid-text-bg {
				width: 100%;
				height: 100%;
				background: linear-gradient(135deg, #5B5BD6 0%, #8B5CF6 100%);
				padding: 16rpx;
				display: flex;
				align-items: center;

				.grid-text {
					font-size: 22rpx;
					color: rgba(255, 255, 255, 0.9);
					line-height: 1.6;
				}
			}

			.grid-overlay {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				background: linear-gradient(transparent, rgba(0, 0, 0, 0.4));
				padding: 12rpx 10rpx 10rpx;

				.grid-likes {
					font-size: 20rpx;
					color: rgba(255, 255, 255, 0.9);
				}
			}
		}
	}

	/* Skill 列表 */
	.skills-list {
		padding: 16rpx 20rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;

		.skill-mini-card {
			background: #fff;
			border-radius: 16rpx;
			padding: 20rpx;
			display: flex;
			align-items: center;
			gap: 16rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

			.smc-icon {
				width: 80rpx;
				height: 80rpx;
				background: #F0F0FD;
				border-radius: 18rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.smc-emoji {
					font-size: 40rpx;
				}
			}

			.smc-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 6rpx;

				.smc-title {
					font-size: 28rpx;
					font-weight: 700;
					color: #1A1A2E;
				}

				.smc-desc {
					font-size: 22rpx;
					color: #9CA3AF;
				}

				.smc-foot {
					display: flex;
					align-items: center;
					gap: 12rpx;

					.smc-usage {
						font-size: 22rpx;
						color: #9CA3AF;
					}

					.smc-tags {
						display: flex;
						gap: 6rpx;
					}
				}
			}

			.smc-use-btn {
				background: #5B5BD6;
				padding: 12rpx 24rpx;
				border-radius: 30rpx;
				flex-shrink: 0;

				.smc-use-text {
					font-size: 22rpx;
					color: #fff;
					font-weight: 500;
				}
			}
		}
	}

	.user-tag-ui,
	.smc-tag-ui {
		:deep(.uni-tag) {
			border-radius: 999rpx !important;
			color: #5B5BD6 !important;
			border-color: rgba(91, 91, 214, 0.15) !important;
			background: rgba(91, 91, 214, 0.08) !important;
		}
	}
</style>
