<template>
<div class="rsqzvsbo _section" v-if="meta">
	<div class="blocks">
		<XBlock class="block" v-for="path in meta.pinnedPages" :initial-path="path" :key="path"/>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { toUnicode } from 'punycode';
import XSigninDialog from '@/components/signin-dialog.vue';
import XSignupDialog from '@/components/signup-dialog.vue';
import MkButton from '@/components/ui/button.vue';
import XNotes from '@/components/notes.vue';
import XBlock from './welcome.entrance.block.vue';
import { host, instanceName } from '@/config';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkButton,
		XNotes,
		XBlock,
	},

	data() {
		return {
			host: toUnicode(host),
			instanceName,
			meta: null,
		};
	},

	created() {
		os.api('meta', { detail: true }).then(meta => {
			this.meta = meta;
		});

		os.api('stats').then(stats => {
			this.stats = stats;
		});
	},

	methods: {
		signin() {
			os.popup(XSigninDialog, {
				autoSet: true
			}, {}, 'closed');
		},

		signup() {
			os.popup(XSignupDialog, {
				autoSet: true
			}, {}, 'closed');
		}
	}
});
</script>

<style lang="scss" scoped>
.rsqzvsbo {
	text-align: center;

	> .blocks {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		grid-gap: var(--margin);
		text-align: left;

		> .block {
			height: 600px;
		}

		@media (max-width: 800px) {
			grid-template-columns: 1fr;
		}
	}
}
</style>
