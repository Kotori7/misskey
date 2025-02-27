<template>
<div class="_section">
	<div class="_content">
		<div class="_card _vMargin">
			<div class="_title">Dialog</div>
			<div class="_content">
				<MkInput v-model:value="dialogTitle">
					<span>Title</span>
				</MkInput>
				<MkInput v-model:value="dialogBody">
					<span>Body</span>
				</MkInput>
				<MkRadio v-model="dialogType" value="info">Info</MkRadio>
				<MkRadio v-model="dialogType" value="success">Success</MkRadio>
				<MkRadio v-model="dialogType" value="warning">Warn</MkRadio>
				<MkRadio v-model="dialogType" value="error">Error</MkRadio>
				<MkSwitch v-model:value="dialogCancel">
					<span>With cancel button</span>
				</MkSwitch>
				<MkSwitch v-model:value="dialogCancelByBgClick">
					<span>Can cancel by modal bg click</span>
				</MkSwitch>
				<MkSwitch v-model:value="dialogInput">
					<span>With input field</span>
				</MkSwitch>
				<MkButton @click="showDialog()">Show</MkButton>
			</div>
			<div class="_content">
				<code>Result: {{ dialogResult }}</code>
			</div>
		</div>

		<div class="_card _vMargin">
			<div class="_title">Form</div>
			<div class="_content">
				<MkInput v-model:value="formTitle">
					<span>Title</span>
				</MkInput>
				<MkTextarea v-model:value="formForm">
					<span>Form</span>
				</MkTextarea>
				<MkButton @click="form()">Show</MkButton>
			</div>
			<div class="_content">
				<code>Result: {{ formResult }}</code>
			</div>
		</div>

		<div class="_card _vMargin">
			<div class="_title">MFM</div>
			<div class="_content">
				<MkTextarea v-model:value="mfm">
					<span>MFM</span>
				</MkTextarea>
			</div>
			<div class="_content">
				<Mfm :text="mfm"/>
			</div>
		</div>

		<div class="_card _vMargin">
			<div class="_title">selectDriveFile</div>
			<div class="_content">
				<MkSwitch v-model:value="selectDriveFileMultiple">
					<span>Multiple</span>
				</MkSwitch>
				<MkButton @click="selectDriveFile()">selectDriveFile</MkButton>
			</div>
			<div class="_content">
				<code>Result: {{ JSON.stringify(selectDriveFileResult) }}</code>
			</div>
		</div>

		<div class="_card _vMargin">
			<div class="_title">selectDriveFolder</div>
			<div class="_content">
				<MkSwitch v-model:value="selectDriveFolderMultiple">
					<span>Multiple</span>
				</MkSwitch>
				<MkButton @click="selectDriveFolder()">selectDriveFolder</MkButton>
			</div>
			<div class="_content">
				<code>Result: {{ JSON.stringify(selectDriveFolderResult) }}</code>
			</div>
		</div>

		<div class="_card _vMargin">
			<div class="_title">selectUser</div>
			<div class="_content">
				<MkButton @click="selectUser()">selectUser</MkButton>
			</div>
			<div class="_content">
				<code>Result: {{ user }}</code>
			</div>
		</div>

		<div class="_card _vMargin">
			<div class="_title">Notification</div>
			<div class="_content">
				<MkInput v-model:value="notificationIconUrl">
					<span>Icon URL</span>
				</MkInput>
				<MkInput v-model:value="notificationHeader">
					<span>Header</span>
				</MkInput>
				<MkTextarea v-model:value="notificationBody">
					<span>Body</span>
				</MkTextarea>
				<MkButton @click="createNotification()">createNotification</MkButton>
			</div>
		</div>

		<div class="_card _vMargin">
			<div class="_title">Waiting dialog</div>
			<div class="_content">
				<MkButton inline @click="openWaitingDialog()">icon only</MkButton>
				<MkButton inline @click="openWaitingDialog('Doing')">with text</MkButton>
			</div>
		</div>

		<div class="_card _vMargin">
			<div class="_title">Messaging window</div>
			<div class="_content">
				<MkButton @click="messagingWindowOpen()">open</MkButton>
			</div>
		</div>

		<MkButton @click="resetTutorial()">Reset tutorial</MkButton>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import MkButton from '@/components/ui/button.vue';
import MkInput from '@/components/ui/input.vue';
import MkSwitch from '@/components/ui/switch.vue';
import MkTextarea from '@/components/ui/textarea.vue';
import MkRadio from '@/components/ui/radio.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkButton,
		MkInput,
		MkSwitch,
		MkTextarea,
		MkRadio,
	},

	data() {
		return {
			INFO: {
				title: 'TEST',
				icon: faExclamationTriangle
			},
			dialogTitle: 'Hello',
			dialogBody: 'World!',
			dialogType: 'info',
			dialogCancel: false,
			dialogCancelByBgClick: true,
			dialogInput: false,
			dialogResult: null,
			formTitle: 'Test form',
			formForm: JSON.stringify({
				foo: {
					type: 'boolean',
					default: true,
					label: 'This is a boolean property'
				},
				bar: {
					type: 'number',
					default: 300,
					label: 'This is a number property'
				},
				baz: {
					type: 'string',
					default: 'Misskey makes you happy.',
					label: 'This is a string property'
				},
				qux: {
					type: 'string',
					multiline: true,
					default: 'Misskey makes\nyou happy.',
					label: 'Multiline string'
				},
			}, null, '\t'),
			formResult: null,
			mfm: '',
			selectDriveFileMultiple: false,
			selectDriveFolderMultiple: false,
			selectDriveFileResult: null,
			selectDriveFolderResult: null,
			user: null,
			notificationIconUrl: null,
			notificationHeader: '',
			notificationBody: '',
		}
	},

	methods: {
		async showDialog() {
			this.dialogResult = null;
			this.dialogResult = await os.dialog({
				type: this.dialogType,
				title: this.dialogTitle,
				text: this.dialogBody,
				showCancelButton: this.dialogCancel,
				cancelableByBgClick: this.dialogCancelByBgClick,
				input: this.dialogInput ? {} : null
			});
		},

		async form() {
			this.formResult = null;
			this.formResult = await os.form(this.formTitle, JSON.parse(this.formForm));
		},

		async selectDriveFile() {
			this.selectDriveFileResult = null;
			this.selectDriveFileResult = await os.selectDriveFile(this.selectDriveFileMultiple);
		},

		async selectDriveFolder() {
			this.selectDriveFolderResult = null;
			this.selectDriveFolderResult = await os.selectDriveFolder(this.selectDriveFolderMultiple);
		},

		async selectUser() {
			this.user = null;
			this.user = await os.selectUser();
		},

		async createNotification() {
			os.api('notifications/create', {
				header: this.notificationHeader,
				body: this.notificationBody,
				icon: this.notificationIconUrl,
			});
		},

		messagingWindowOpen() {
			os.pageWindow('/my/messaging');
		},

		openWaitingDialog(text?) {
			const promise = new Promise((resolve, reject) => {
				setTimeout(resolve, 2000);
			});
			os.promiseDialog(promise, null, null, text);
		},

		resetTutorial() {
			this.$store.dispatch('settings/set', { key: 'tutorial', value: 0 });
		},
	}
});
</script>
