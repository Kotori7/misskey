<template>
<div class="jmgmzlwq _panel"><Fa :icon="faExclamationTriangle" style="margin-right: 8px;"/>{{ $t('remoteUserCaution') }}<a :href="href" rel="nofollow noopener" target="_blank">{{ $t('showOnRemote') }}</a></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import * as os from '@/os';

export default defineComponent({
	props: {
		href: {
			type: String,
			required: true
		},
	},
	data() {
		return {
			faExclamationTriangle
		};
	}
});
</script>

<style lang="scss" scoped>
.jmgmzlwq {
	font-size: 0.8em;
	padding: 16px;
	background: var(--infoWarnBg);
	color: var(--infoWarnFg);

	> a {
		margin-left: 4px;
		color: var(--accent);
	}
}
</style>
