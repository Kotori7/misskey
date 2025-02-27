<template>
<FormBase>
	<FormRange v-model:value="masterVolume" :min="0" :max="1" :step="0.05">
		<template #label><Fa :icon="volumeIcon" :key="volumeIcon"/> {{ $t('masterVolume') }}</template>
	</FormRange>

	<FormGroup>
		<template #label>{{ $t('sounds') }}</template>
		<FormButton v-for="type in Object.keys(sounds)" :key="type" :center="false" @click="edit(type)">
			{{ $t('_sfx.' + type) }}
			<template #suffix>{{ sounds[type].type || $t('none') }}</template>
			<template #suffixIcon><Fa :icon="faChevronDown"/></template>
		</FormButton>
	</FormGroup>

	<FormButton @click="reset()" danger><Fa :icon="faRedo"/> {{ $t('default') }}</FormButton>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faMusic, faPlay, faVolumeUp, faVolumeMute, faChevronDown, faRedo } from '@fortawesome/free-solid-svg-icons';
import FormRange from '@/components/form/range.vue';
import FormSelect from '@/components/form/select.vue';
import FormBase from '@/components/form/base.vue';
import FormButton from '@/components/form/button.vue';
import FormGroup from '@/components/form/group.vue';
import * as os from '@/os';
import { device, defaultDeviceSettings } from '@/cold-storage';
import { playFile } from '@/scripts/sound';

const soundsTypes = [
	null,
	'syuilo/up',
	'syuilo/down',
	'syuilo/pope1',
	'syuilo/pope2',
	'syuilo/waon',
	'syuilo/popo',
	'syuilo/triple',
	'syuilo/poi1',
	'syuilo/poi2',
	'syuilo/pirori',
	'syuilo/pirori-wet',
	'syuilo/pirori-square-wet',
	'syuilo/square-pico',
	'syuilo/reverved',
	'syuilo/ryukyu',
	'syuilo/kick',
	'syuilo/snare',
	'aisha/1',
	'aisha/2',
	'aisha/3',
	'noizenecio/kick_gaba',
	'noizenecio/kick_gaba2',
];

export default defineComponent({
	components: {
		FormSelect,
		FormButton,
		FormBase,
		FormRange,
		FormGroup,
	},

	emits: ['info'],

	data() {
		return {
			INFO: {
				title: this.$t('sounds'),
				icon: faMusic
			},
			sounds: {},
			faMusic, faPlay, faVolumeUp, faVolumeMute, faChevronDown, faRedo,
		}
	},

	computed: {
		masterVolume: { // TODO: (外部)関数にcomputedを使うのはアレなので直す
			get() { return device.get('sound_masterVolume'); },
			set(value) { device.set('sound_masterVolume', value); }
		},
		volumeIcon() {
			return this.masterVolume === 0 ? faVolumeMute : faVolumeUp;
		}
	},

	created() {
		this.sounds.note = device.get('sound_note');
		this.sounds.noteMy = device.get('sound_noteMy');
		this.sounds.notification = device.get('sound_notification');
		this.sounds.chat = device.get('sound_chat');
		this.sounds.chatBg = device.get('sound_chatBg');
		this.sounds.antenna = device.get('sound_antenna');
		this.sounds.channel = device.get('sound_channel');
		this.sounds.reversiPutBlack = device.get('sound_reversiPutBlack');
		this.sounds.reversiPutWhite = device.get('sound_reversiPutWhite');
	},

	mounted() {
		this.$emit('info', this.INFO);
	},

	methods: {
		async edit(type) {
			const { canceled, result } = await os.form(this.$t('_sfx.' + type), {
				type: {
					type: 'enum',
					enum: soundsTypes.map(x => ({
						value: x,
						label: x == null ? this.$t('none') : x,
					})),
					label: this.$t('sound'),
					default: this.sounds[type].type,
				},
				volume: {
					type: 'range',
					mim: 0,
					max: 1,
					step: 0.05,
					label: this.$t('volume'),
					default: this.sounds[type].volume
				},
				listen: {
					type: 'button',
					content: this.$t('listen'),
					action: (_, values) => {
						playFile(values.type, values.volume);
					}
				}
			});
			if (canceled) return;

			const v = {
				type: result.type,
				volume: result.volume,
			};

			device.set('sound_' + type, v);
			this.sounds[type] = v;
		},

		reset() {
			for (const sound of Object.keys(this.sounds)) {
				const v = defaultDeviceSettings['sound_' + sound];
				device.set('sound_' + sound, v);
				this.sounds[sound] = v;
			}
		}
	}
});
</script>
