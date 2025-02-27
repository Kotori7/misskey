<template>
<div class="mk-modal" v-hotkey.global="keymap" :style="{ pointerEvents: showing ? 'auto' : 'none', '--transformOrigin': transformOrigin }">
	<transition :name="$store.state.device.animation ? 'modal-bg' : ''" appear>
		<div class="bg _modalBg" v-if="showing" @click="onBgClick"></div>
	</transition>
	<div class="content" :class="{ popup, fixed, top: position === 'top' }" @click.self="onBgClick" ref="content">
		<transition :name="$store.state.device.animation ? popup ? 'modal-popup-content' : 'modal-content' : ''" appear @after-leave="$emit('closed')" @after-enter="childRendered">
			<slot v-if="showing"></slot>
		</transition>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

function getFixedContainer(el: Element | null): Element | null {
	if (el == null || el.tagName === 'BODY') return null;
	const position = window.getComputedStyle(el).getPropertyValue('position');
	if (position === 'fixed') {
		return el;
	} else {
		return getFixedContainer(el.parentElement);
	}
}

export default defineComponent({
	provide: {
		modal: true
	},
	props: {
		srcCenter: {
			type: Boolean,
			required: false
		},
		src: {
			required: false,
		},
		position: {
			required: false
		}
	},
	emits: ['click', 'esc', 'closed'],
	data() {
		return {
			showing: true,
			fixed: false,
			transformOrigin: 'center',
			contentClicking: false,
		};
	},
	computed: {
		keymap(): any {
			return {
				'esc': () => this.$emit('esc'),
			};
		},
		popup(): boolean {
			return this.src != null;
		}
	},
	mounted() {
		this.fixed = getFixedContainer(this.src) != null;

		this.$nextTick(() => {
			if (!this.popup) return;

			const popover = this.$refs.content as any;

			// TODO: ResizeObserver無くしたい
			new ResizeObserver((entries, observer) => {
				const rect = this.src.getBoundingClientRect();
				const width = popover.offsetWidth;
				const height = popover.offsetHeight;

				let left;
				let top;

				if (this.srcCenter) {
					const x = rect.left + (this.fixed ? 0 : window.pageXOffset) + (this.src.offsetWidth / 2);
					const y = rect.top + (this.fixed ? 0 : window.pageYOffset) + (this.src.offsetHeight / 2);
					left = (x - (width / 2));
					top = (y - (height / 2));
				} else {
					const x = rect.left + (this.fixed ? 0 : window.pageXOffset) + (this.src.offsetWidth / 2);
					const y = rect.top + (this.fixed ? 0 : window.pageYOffset) + this.src.offsetHeight;
					left = (x - (width / 2));
					top = y;
				}

				if (this.fixed) {
					if (left + width > window.innerWidth) {
						left = window.innerWidth - width;
					}

					if (top + height > window.innerHeight) {
						top = window.innerHeight - height;
					}
				} else {
					if (left + width - window.pageXOffset > window.innerWidth) {
						left = window.innerWidth - width + window.pageXOffset;
					}

					if (top + height - window.pageYOffset > window.innerHeight) {
						top = window.innerHeight - height + window.pageYOffset;
					}
				}

				if (top < 0) {
					top = 0;
				}

				if (left < 0) {
					left = 0;
				}

				if (top > rect.top + (this.fixed ? 0 : window.pageYOffset)) {
					this.transformOrigin = 'center top';
				}

				popover.style.left = left + 'px';
				popover.style.top = top + 'px';
			}).observe(popover);
		});
	},
	methods: {
		childRendered() {
			// モーダルコンテンツにマウスボタンが押され、コンテンツ外でマウスボタンが離されたときにモーダルバックグラウンドクリックと判定させないためにマウスイベントを監視しフラグ管理する
			const content = this.$refs.content.children[0];
			content.addEventListener('mousedown', e => {
				this.contentClicking = true;
				window.addEventListener('mouseup', e => {
					// click イベントより先に mouseup イベントが発生するかもしれないのでちょっと待つ
					setTimeout(() => {
						this.contentClicking = false;
					}, 100);
				}, { passive: true, once: true });
			}, { passive: true });
		},

		close() {
			this.showing = false;
		},

		onBgClick() {
			if (this.contentClicking) return;
			this.$emit('click');
		}
	}
});
</script>

<style>
.modal-popup-content-enter-active, .modal-popup-content-leave-active,
.modal-content-enter-from, .modal-content-leave-to {
  transform-origin: var(--transformOrigin);
}
</style>

<style lang="scss" scoped>
.modal-bg-enter-active, .modal-bg-leave-active {
	transition: opacity 0.3s !important;
}
.modal-bg-enter-from, .modal-bg-leave-to {
	opacity: 0;
}

.modal-content-enter-active, .modal-content-leave-active {
	transition: opacity 0.3s, transform 0.3s !important;
}
.modal-content-enter-from, .modal-content-leave-to {
	pointer-events: none;
	opacity: 0;
	transform: scale(0.9);
}

.modal-popup-content-enter-active, .modal-popup-content-leave-active {
	transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.modal-popup-content-enter-from, .modal-popup-content-leave-to {
	pointer-events: none;
	opacity: 0;
	transform: scale(0.9);
}

.mk-modal {
	> .bg {
		z-index: 10000;
	}

	> .content:not(.popup) {
		position: fixed;
		z-index: 10000;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto;
		padding: 32px;
		// TODO: mask-imageはiOSだとやたら重い。なんとかしたい
		-webkit-mask-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 32px, rgba(0,0,0,1) calc(100% - 32px), rgba(0,0,0,0) 100%);
		mask-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 32px, rgba(0,0,0,1) calc(100% - 32px), rgba(0,0,0,0) 100%);
		overflow: auto;
		display: flex;

		@media (max-width: 500px) {
			padding: 16px;
			-webkit-mask-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 16px, rgba(0,0,0,1) calc(100% - 16px), rgba(0,0,0,0) 100%);
			mask-image: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 16px, rgba(0,0,0,1) calc(100% - 16px), rgba(0,0,0,0) 100%);
		}

		> * {
			margin: auto;
		}

		&.top {
			> * {
				margin-top: 0;
			}
		}
	}

	> .content.popup {
		position: absolute;
		z-index: 10000;

		&.fixed {
			position: fixed;
		}
	}
}
</style>
