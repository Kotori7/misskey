<template>
<FormBase>
	<FormSelect v-model:value="selectedThemeId">
		<template #label>{{ $t('installedThemes') }}</template>
		<option v-for="x in installedThemes" :value="x.id" :key="x.id">{{ x.name }}</option>
		<optgroup :label="$t('builtinThemes')">
			<option v-for="x in builtinThemes" :value="x.id" :key="x.id">{{ x.name }}</option>
		</optgroup>
	</FormSelect>
	<template v-if="selectedTheme">
		<FormInput readonly :value="selectedTheme.author">
			<span>{{ $t('author') }}</span>
		</FormInput>
		<FormTextarea readonly tall :value="selectedThemeCode">
			<span>{{ $t('_theme.code') }}</span>
			<template #desc><button @click="copyThemeCode()" class="_textButton">{{ $t('copy') }}</button></template>
		</FormTextarea>
		<FormButton @click="uninstall()" danger v-if="!builtinThemes.some(t => t.id == selectedTheme.id)"><Fa :icon="faTrashAlt"/> {{ $t('uninstall') }}</FormButton>
	</template>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faPalette, faDownload, faFolderOpen, faCheck, faTrashAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import * as JSON5 from 'json5';
import FormTextarea from '@/components/form/textarea.vue';
import FormSelect from '@/components/form/select.vue';
import FormRadios from '@/components/form/radios.vue';
import FormBase from '@/components/form/base.vue';
import FormGroup from '@/components/form/group.vue';
import FormInput from '@/components/form/input.vue';
import FormButton from '@/components/form/button.vue';
import { Theme, builtinThemes } from '@/scripts/theme';
import copyToClipboard from '@/scripts/copy-to-clipboard';
import * as os from '@/os';

export default defineComponent({
	components: {
		FormTextarea,
		FormSelect,
		FormRadios,
		FormBase,
		FormGroup,
		FormInput,
		FormButton,
	},

	emits: ['info'],
	
	data() {
		return {
			INFO: {
				title: this.$t('_theme.manage'),
				icon: faFolderOpen
			},
			builtinThemes,
			selectedThemeId: null,
			faPalette, faDownload, faFolderOpen, faCheck, faTrashAlt, faEye
		}
	},

	computed: {
		themes(): Theme[] {
			return builtinThemes.concat(this.$store.state.device.themes);
		},

		installedThemes(): Theme[] {
			return this.$store.state.device.themes;
		},
	
		selectedTheme() {
			if (this.selectedThemeId == null) return null;
			return this.themes.find(x => x.id === this.selectedThemeId);
		},

		selectedThemeCode() {
			if (this.selectedTheme == null) return null;
			return JSON5.stringify(this.selectedTheme, null, '\t');
		},
	},

	mounted() {
		this.$emit('info', this.INFO);
	},

	methods: {
		copyThemeCode() {
			copyToClipboard(this.selectedThemeCode);
			os.success();
		},

		uninstall() {
			const theme = this.selectedTheme;
			const themes = this.$store.state.device.themes.filter(t => t.id != theme.id);
			this.$store.commit('device/set', {
				key: 'themes', value: themes
			});
			os.success();
		},
	}
});
</script>
