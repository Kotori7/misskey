<template>
<FormBase>
	<FormGroup>
		<FormInput v-model:value="emailAddress" type="email">
			{{ $t('emailAddress') }}
			<template #desc v-if="$store.state.i.email && !$store.state.i.emailVerified">{{ $t('verificationEmailSent') }}</template>
			<template #desc v-else-if="emailAddress === $store.state.i.email && $store.state.i.emailVerified">{{ $t('emailVerified') }}</template>
		</FormInput>
	</FormGroup>
	<FormButton @click="save" primary>{{ $t('save') }}</FormButton>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faBell, faEnvelope } from '@fortawesome/free-regular-svg-icons';
import FormButton from '@/components/form/button.vue';
import FormInput from '@/components/form/input.vue';
import FormBase from '@/components/form/base.vue';
import FormGroup from '@/components/form/group.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		FormBase,
		FormInput,
		FormButton,
		FormGroup,
	},

	emits: ['info'],
	
	data() {
		return {
			INFO: {
				title: this.$t('emailAddress'),
				icon: faEnvelope
			},
			emailAddress: null,
			code: null,
			faCog
		}
	},

	created() {
		this.emailAddress = this.$store.state.i.email;
	},

	mounted() {
		this.$emit('info', this.INFO);
	},

	methods: {
		save() {
			os.dialog({
				title: this.$t('password'),
				input: {
					type: 'password'
				}
			}).then(({ canceled, result: password }) => {
				if (canceled) return;
				os.api('i/update-email', {
					password: password,
					email: this.emailAddress,
				});
			});
		}
	}
});
</script>
