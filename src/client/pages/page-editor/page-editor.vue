<template>
<div class="_section">
	<div class="_content">
		<MkA class="view" v-if="pageId" :to="`/@${ author.username }/pages/${ currentName }`"><Fa :icon="faExternalLinkSquareAlt"/> {{ $t('_pages.viewPage') }}</MkA>

		<MkButton @click="save" primary class="save" style="margin: 16px auto 16px auto;"><Fa :icon="faSave"/> {{ $t('save') }}</MkButton>

		<MkContainer :body-togglable="true" :expanded="true" class="_vMargin">
			<template #header><Fa :icon="faCog"/> {{ $t('_pages.pageSetting') }}</template>
			<div class="_section">
				<MkInput v-model:value="title">
					<span>{{ $t('_pages.title') }}</span>
				</MkInput>

				<MkInput v-model:value="summary">
					<span>{{ $t('_pages.summary') }}</span>
				</MkInput>

				<MkInput v-model:value="name">
					<template #prefix>{{ url }}/@{{ author.username }}/pages/</template>
					<span>{{ $t('_pages.url') }}</span>
				</MkInput>

				<MkSwitch v-model:value="alignCenter">{{ $t('_pages.alignCenter') }}</MkSwitch>

				<MkSelect v-model:value="font">
					<template #label>{{ $t('_pages.font') }}</template>
					<option value="serif">{{ $t('_pages.fontSerif') }}</option>
					<option value="sans-serif">{{ $t('_pages.fontSansSerif') }}</option>
				</MkSelect>

				<MkSwitch v-model:value="hideTitleWhenPinned">{{ $t('_pages.hideTitleWhenPinned') }}</MkSwitch>

				<div class="eyeCatch">
					<MkButton v-if="eyeCatchingImageId == null && !readonly" @click="setEyeCatchingImage"><Fa :icon="faPlus"/> {{ $t('_pages.eyeCatchingImageSet') }}</MkButton>
					<div v-else-if="eyeCatchingImage">
						<img :src="eyeCatchingImage.url" :alt="eyeCatchingImage.name" style="max-width: 100%;"/>
						<MkButton @click="removeEyeCatchingImage()" v-if="!readonly"><Fa :icon="faTrashAlt"/> {{ $t('_pages.eyeCatchingImageRemove') }}</MkButton>
					</div>
				</div>
			</div>
		</MkContainer>

		<MkContainer :body-togglable="true" :expanded="true" class="_vMargin">
			<template #header><Fa :icon="faStickyNote"/> {{ $t('_pages.contents') }}</template>
			<div class="_section">
				<XBlocks class="content" v-model:value="content" :hpml="hpml"/>

				<MkButton @click="add()" v-if="!readonly"><Fa :icon="faPlus"/></MkButton>
			</div>
		</MkContainer>

		<MkContainer :body-togglable="true" class="_vMargin">
			<template #header><Fa :icon="faMagic"/> {{ $t('_pages.variables') }}</template>
			<div class="qmuvgica">
				<XDraggable tag="div" class="variables" v-show="variables.length > 0" :list="variables" handle=".drag-handle" :group="{ name: 'variables' }" animation="150" swap-threshold="0.5">
					<XVariable v-for="variable in variables"
						:value="variable"
						:removable="true"
						@update:value="v => updateVariable(v)"
						@remove="() => removeVariable(variable)"
						:key="variable.name"
						:hpml="hpml"
						:name="variable.name"
						:title="variable.name"
						:draggable="true"
					/>
				</XDraggable>

				<MkButton @click="addVariable()" class="add" v-if="!readonly"><Fa :icon="faPlus"/></MkButton>
			</div>
		</MkContainer>

		<MkContainer :body-togglable="true" :expanded="true" class="_vMargin">
			<template #header><Fa :icon="faCode"/> {{ $t('script') }}</template>
			<div>
				<MkTextarea class="_code" v-model:value="script"/>
			</div>
		</MkContainer>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, computed } from 'vue';
import 'prismjs';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-okaidia.css';
import 'vue-prism-editor/dist/prismeditor.min.css';
import { faICursor, faPlus, faMagic, faCog, faCode, faExternalLinkSquareAlt, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { faSave, faStickyNote, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { v4 as uuid } from 'uuid';
import XVariable from './page-editor.script-block.vue';
import XBlocks from './page-editor.blocks.vue';
import MkTextarea from '@/components/ui/textarea.vue';
import MkContainer from '@/components/ui/container.vue';
import MkButton from '@/components/ui/button.vue';
import MkSelect from '@/components/ui/select.vue';
import MkSwitch from '@/components/ui/switch.vue';
import MkInput from '@/components/ui/input.vue';
import { blockDefs } from '@/scripts/hpml/index';
import { HpmlTypeChecker } from '@/scripts/hpml/type-checker';
import { url } from '@/config';
import { collectPageVars } from '@/scripts/collect-page-vars';
import * as os from '@/os';
import { selectFile } from '@/scripts/select-file';

export default defineComponent({
	components: {
		XDraggable: defineAsyncComponent(() => import('vue-draggable-next').then(x => x.VueDraggableNext)),
		XVariable, XBlocks, MkTextarea, MkContainer, MkButton, MkSelect, MkSwitch, MkInput,
	},

	props: {
		initPageId: {
			type: String,
			required: false
		},
		initPageName: {
			type: String,
			required: false
		},
		initUser: {
			type: String,
			required: false
		},
	},

	data() {
		return {
			INFO: computed(() => this.initPageId ? {
				title: this.$t('_pages.editPage'),
				icon: faPencilAlt,
			} : {
				title: this.$t('_pages.newPage'),
				icon: faPencilAlt,
			}),
			author: this.$store.state.i,
			readonly: false,
			page: null,
			pageId: null,
			currentName: null,
			title: '',
			summary: null,
			name: Date.now().toString(),
			eyeCatchingImage: null,
			eyeCatchingImageId: null,
			font: 'sans-serif',
			content: [],
			alignCenter: false,
			hideTitleWhenPinned: false,
			variables: [],
			hpml: null,
			script: '',
			url,
			faPlus, faICursor, faSave, faStickyNote, faMagic, faCog, faTrashAlt, faExternalLinkSquareAlt, faCode
		};
	},

	watch: {
		async eyeCatchingImageId() {
			if (this.eyeCatchingImageId == null) {
				this.eyeCatchingImage = null;
			} else {
				this.eyeCatchingImage = await os.api('drive/files/show', {
					fileId: this.eyeCatchingImageId,
				});
			}
		},
	},

	async created() {
		this.hpml = new HpmlTypeChecker();

		this.$watch('variables', () => {
			this.hpml.variables = this.variables;
		}, { deep: true });

		this.$watch('content', () => {
			this.hpml.pageVars = collectPageVars(this.content);
		}, { deep: true });

		if (this.initPageId) {
			this.page = await os.api('pages/show', {
				pageId: this.initPageId,
			});
		} else if (this.initPageName && this.initUser) {
			this.page = await os.api('pages/show', {
				name: this.initPageName,
				username: this.initUser,
			});
			this.readonly = true;
		}

		if (this.page) {
			this.author = this.page.user;
			this.pageId = this.page.id;
			this.title = this.page.title;
			this.name = this.page.name;
			this.currentName = this.page.name;
			this.summary = this.page.summary;
			this.font = this.page.font;
			this.script = this.page.script;
			this.hideTitleWhenPinned = this.page.hideTitleWhenPinned;
			this.alignCenter = this.page.alignCenter;
			this.content = this.page.content;
			this.variables = this.page.variables;
			this.eyeCatchingImageId = this.page.eyeCatchingImageId;
		} else {
			const id = uuid();
			this.content = [{
				id,
				type: 'text',
				text: 'Hello World!'
			}];
		}
	},

	provide() {
		return {
			readonly: this.readonly,
			getScriptBlockList: this.getScriptBlockList,
			getPageBlockList: this.getPageBlockList
		}
	},

	methods: {
		save() {
			const options = {
				title: this.title.trim(),
				name: this.name.trim(),
				summary: this.summary,
				font: this.font,
				script: this.script,
				hideTitleWhenPinned: this.hideTitleWhenPinned,
				alignCenter: this.alignCenter,
				content: this.content,
				variables: this.variables,
				eyeCatchingImageId: this.eyeCatchingImageId,
			};

			const onError = err => {
				if (err.id == '3d81ceae-475f-4600-b2a8-2bc116157532') {
					if (err.info.param == 'name') {
						os.dialog({
							type: 'error',
							title: this.$t('_pages.invalidNameTitle'),
							text: this.$t('_pages.invalidNameText')
						});
					}
				} else if (err.code == 'NAME_ALREADY_EXISTS') {
					os.dialog({
						type: 'error',
						text: this.$t('_pages.nameAlreadyExists')
					});
				}
			};

			if (this.pageId) {
				options.pageId = this.pageId;
				os.api('pages/update', options)
				.then(page => {
					this.currentName = this.name.trim();
					os.dialog({
						type: 'success',
						text: this.$t('_pages.updated')
					});
				}).catch(onError);
			} else {
				os.api('pages/create', options)
				.then(page => {
					this.pageId = page.id;
					this.currentName = this.name.trim();
					os.dialog({
						type: 'success',
						text: this.$t('_pages.created')
					});
					this.$router.push(`/pages/edit/${this.pageId}`);
				}).catch(onError);
			}
		},

		del() {
			os.dialog({
				type: 'warning',
				text: this.$t('removeAreYouSure', { x: this.title.trim() }),
				showCancelButton: true
			}).then(({ canceled }) => {
				if (canceled) return;
				os.api('pages/delete', {
					pageId: this.pageId,
				}).then(() => {
					os.dialog({
						type: 'success',
						text: this.$t('_pages.deleted')
					});
					this.$router.push(`/pages`);
				});
			});
		},

		async add() {
			const { canceled, result: type } = await os.dialog({
				type: null,
				title: this.$t('_pages.chooseBlock'),
				select: {
					groupedItems: this.getPageBlockList()
				},
				showCancelButton: true
			});
			if (canceled) return;

			const id = uuid();
			this.content.push({ id, type });
		},

		async addVariable() {
			let { canceled, result: name } = await os.dialog({
				title: this.$t('_pages.enterVariableName'),
				input: {
					type: 'text',
				},
				showCancelButton: true
			});
			if (canceled) return;

			name = name.trim();

			if (this.hpml.isUsedName(name)) {
				os.dialog({
					type: 'error',
					text: this.$t('_pages.variableNameIsAlreadyUsed')
				});
				return;
			}

			const id = uuid();
			this.variables.push({ id, name, type: null });
		},

		removeVariable(v) {
			const i = this.variables.findIndex(x => x.name === v.name);
			const newValue = [
				...this.variables.slice(0, i),
				...this.variables.slice(i + 1)
			];
			this.variables = newValue;
		},

		getPageBlockList() {
			return [{
				label: this.$t('_pages.contentBlocks'),
				items: [
					{ value: 'section', text: this.$t('_pages.blocks.section') },
					{ value: 'text', text: this.$t('_pages.blocks.text') },
					{ value: 'image', text: this.$t('_pages.blocks.image') },
					{ value: 'textarea', text: this.$t('_pages.blocks.textarea') },
					{ value: 'note', text: this.$t('_pages.blocks.note') },
					{ value: 'canvas', text: this.$t('_pages.blocks.canvas') },
				]
			}, {
				label: this.$t('_pages.inputBlocks'),
				items: [
					{ value: 'button', text: this.$t('_pages.blocks.button') },
					{ value: 'radioButton', text: this.$t('_pages.blocks.radioButton') },
					{ value: 'textInput', text: this.$t('_pages.blocks.textInput') },
					{ value: 'textareaInput', text: this.$t('_pages.blocks.textareaInput') },
					{ value: 'numberInput', text: this.$t('_pages.blocks.numberInput') },
					{ value: 'switch', text: this.$t('_pages.blocks.switch') },
					{ value: 'counter', text: this.$t('_pages.blocks.counter') }
				]
			}, {
				label: this.$t('_pages.specialBlocks'),
				items: [
					{ value: 'if', text: this.$t('_pages.blocks.if') },
					{ value: 'post', text: this.$t('_pages.blocks.post') }
				]
			}];
		},

		getScriptBlockList(type: string = null) {
			const list = [];

			const blocks = blockDefs.filter(block => type === null || block.out === null || block.out === type || typeof block.out === 'number');

			for (const block of blocks) {
				const category = list.find(x => x.category === block.category);
				if (category) {
					category.items.push({
						value: block.type,
						text: this.$t(`_pages.script.blocks.${block.type}`)
					});
				} else {
					list.push({
						category: block.category,
						label: this.$t(`_pages.script.categories.${block.category}`),
						items: [{
							value: block.type,
							text: this.$t(`_pages.script.blocks.${block.type}`)
						}]
					});
				}
			}

			const userFns = this.variables.filter(x => x.type === 'fn');
			if (userFns.length > 0) {
				list.unshift({
					label: this.$t(`_pages.script.categories.fn`),
					items: userFns.map(v => ({
						value: 'fn:' + v.name,
						text: v.name
					}))
				});
			}

			return list;
		},

		setEyeCatchingImage(e) {
			selectFile(e.currentTarget || e.target, null, false).then(file => {
				this.eyeCatchingImageId = file.id;
			});
		},

		removeEyeCatchingImage() {
			this.eyeCatchingImageId = null;
		},

		highlighter(code) {
			return highlight(code, languages.js, 'javascript');
		},
	}
});
</script>

<style lang="scss" scoped>
.gwbmwxkm {
	position: relative;

	> header {
		> .title {
			z-index: 1;
			margin: 0;
			padding: 0 16px;
			line-height: 42px;
			font-size: 0.9em;
			font-weight: bold;
			box-shadow: 0 1px rgba(#000, 0.07);

			> [data-icon] {
				margin-right: 6px;
			}

			&:empty {
				display: none;
			}
		}

		> .buttons {
			position: absolute;
			z-index: 2;
			top: 0;
			right: 0;

			> button {
				padding: 0;
				width: 42px;
				font-size: 0.9em;
				line-height: 42px;
			}
		}
	}

	> section {
		padding: 0 32px 32px 32px;

		@media (max-width: 500px) {
			padding: 0 16px 16px 16px;
		}

		> .view {
			display: inline-block;
			margin: 16px 0 0 0;
			font-size: 14px;
		}

		> .content {
			margin-bottom: 16px;
		}

		> .eyeCatch {
			margin-bottom: 16px;

			> div {
				> img {
					max-width: 100%;
				}
			}
		}
	}
}

.qmuvgica {
	padding: 32px;

	@media (max-width: 500px) {
		padding: 16px;
	}

	> .variables {
		margin-bottom: 16px;
	}

	> .add {
		margin-bottom: 16px;
	}
}
</style>
