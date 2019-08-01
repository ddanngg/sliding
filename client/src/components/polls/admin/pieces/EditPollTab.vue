<template>
	<v-tab-item
		:transition="false"
		:reverse-transition="false">
		<v-card-text class="scrollbar-primary text-xs-center poll-content">
			<v-form ref="form">
				<v-layout row wrap :px-3="!isXS">
					<!-- *Poll ask -->
					<v-flex xs12>
						<text-field :field="form.ask" />
					</v-flex>

					<!-- <text-area :field="form.option" /> -->
					<v-flex xs8>
						<template v-for="(row, idx) in optionRows">
							<text-area :key="idx" :field="row" />
						</template>
					</v-flex>
					<v-flex xs12>
						<v-checkbox
							v-model="markCorrect"
							color="primary"
							class="mt-0"
							:label="$t('poll-mark-correct')" />
						<v-checkbox
							v-model="selectMultiple"
							color="primary"
							class="mt-0"
							:label="$t('poll-select-multiple')" />
						<v-checkbox
							v-if="selectMultiple"
							v-model="limitMultiple"
							color="primary"
							class="mt-0"
							:label="$t('poll-limit-select')" />
					</v-flex>

					<!-- *limit of multi choice -->
					<v-flex xs5>
						<text-field
							v-if="limitMultiple"
							color="primary"
							:field="form.limit" />
					</v-flex>
				</v-layout>
			</v-form>
		</v-card-text>

		<v-divider />
		<v-card-actions class="px-3">
			<v-spacer />
			<v-btn
				flat
				medium
				@click="closeDialog">
				<span v-t="'btn-cancel'" class="first-letter-uppercase" />
			</v-btn>
			<v-btn
				flat
				medium
				color="success"
				:disabled="sending"
				@click="handleEPContent">
				<span v-t="'btn-save'" class="first-letter-uppercase" />
			</v-btn>
		</v-card-actions>
	</v-tab-item>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
const initForm = () => ({
	ask: {
		value: '',
		label: 'lb-poll-ask',
		type: 'text',
		autofocus: true,
		required: true,
		errmsg: '',
	},
	limit: {
		value: 2,
		type: 'number',
		solo: true,
		flat: true,
		outline: true,
		errmsg: '',
	},
});

export default {
	name: 'EditPollTab',
	props: {
		id: {
			type: String,
			default: null,
		},
	},
	data: () => ({
		form: initForm(),
		optionRows: [
			{
				value: '',
				placeholder: 'lb-add-option',
				type: 'text',
				rows: 2,
				solo: true,
				flat: true,
				outline: true,
				autogrow: true,
			},
		],
		markCorrect: false,
		selectMultiple: false,
		limitMultiple: false,
		sending: false,
		poll: null,
		pollOptions: [],
	}),
	computed: {
		...mapGetters({
			getPoll: 'admin/polls/getPoll',
		}),
	},
	watch: {
		poll(val) {
			if (val) {
				this.form.ask.value = val.content;
				this.form.limit.value = val.max_choices;
			}
		},
	},
	mounted() {
		this.poll = this.getPoll(this.id);
	},
	methods: {
		...mapMutations({
			mergePoll: 'admin/polls/MERGE_POLL',
		}),
		addOptionRow() {
			this.optionRows.push({
				value: '',
				placeholder: 'lb-add-option',
				type: 'text',
				rows: 2,
				solo: true,
				flat: true,
				outline: true,
				autogrow: true,
				autofocus: true,
			});
		},
		closeDialog() {
			this.$emit('close-dialog');
		},
		handleEPContent() {
			this.sending = true;
			if (this.form.ask.value.trim() === '') {
				this.form.ask.errmsg = this.$t('requireField');
				this.sending = false;
				return;
			}
			if (this.limitMultiple && this.form.limit.value < 2) {
				this.form.limit.errmsg = this.$t('poll-limit-count');
				this.sending = false;
				return;
			}
			if (this.form.ask.value.trim() === this.poll.content) {
				if (this.form.limit.value === this.poll.max_choices) {
					this.sending = false;
					this.closeDialog();
					return;
				}
			}
			this.emitEditPoll({
				id: this.poll.id,
				content: this.form.ask.value.trim(),
				max_choices: this.form.limit.value,
			});
		},
		emitEditPoll(info) {
			const emiter = 'edit-poll';
			const pollEdit = {
				id: this.poll.id,
				...info,
			};
			this.$emit('start-loading');
			this.$socket.emit(emiter, pollEdit, ({ errmsg, poll }) => {
				this.sending = false;
				if (!poll) {
					if (errmsg) {
						this.showNotify(errmsg, 'danger');
					}
					return;
				}
				this.mergePoll(poll);
				this.closeDialog();
			});
		},
		emitEPOption() {
			// ...
		},
	},
};
</script>

<style>
</style>