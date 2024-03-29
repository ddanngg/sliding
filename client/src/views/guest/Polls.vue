<template>
	<div>
		<empty--state-poll v-if="!polls.length" />
		<template v-else>
			<div class="d-flex">
				<span v-t="'poll-live-title'" class="mx-3 my-2 body-1 grey--text" />

				<v-spacer />

				<v-chip id="users-online" small label color="primary" text-color="white">
					<span class="font-weight-bold">
						{{ onlineUsers }}
					</span>
					<v-icon small right v-text="'$vuetify.icons.group_people'" />
				</v-chip>
			</div>

			<card--poll
				v-for="poll in polls"
				:key="poll.id"
				:poll="poll" />
		</template>
	</div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import PollCard from '@/components/polls/guest/PollCard.vue';
import EmptyPoll from '@/components/polls/guest/EmptyPoll.vue';

export default {
	name: 'Polls',
	components: {
		'card--poll': PollCard,
		'empty--state-poll': EmptyPoll,
	},
	computed: {
		...mapGetters({
			polls: 'guest/polls/getPolls',
			onlineUsers: 'guest/event/getOnlineUsers',
		}),
	},
	created() {
		this.emitGetPolls();
	},
	sockets: {
		new_added_poll(poll) {
			this.addPoll(poll);
		},
		new_deleted_poll(poll) {
			this.deletePoll(poll);
		},
		new_edited_poll(newInfo) {
			this.mergePoll(newInfo);
		},
		new_added_poll_option(option) {
			this.addPollOption(option);
		},
		new_edited_poll_option(option) {
			this.mergePollOption(option);
		},
		new_deleted_poll_option(option) {
			this.deletePollOption(option);
		},
		new_poll_option_choices(choices) {
			this.editPollOptionChoices(choices);
		},
	},
	methods: {
		...mapMutations({
			setPolls: 'guest/polls/SET_POLLS',
			addPoll: 'guest/polls/ADD_POLL',
			mergePoll: 'guest/polls/MERGE_POLL',
			deletePoll: 'guest/polls/DELETE_POLL',
			setPollOptions: 'guest/pollOptions/SET_POLL_OPTIONS',
			addPollOption: 'guest/pollOptions/ADD_POLL_OPTION',
			mergePollOption: 'guest/pollOptions/MERGE_POLL_OPTION',
			deletePollOption: 'guest/pollOptions/DELETE_POLL_OPTION',
			setPollOptionChoices: 'guest/pollOptions/SET_POLL_OPTION_CHOICES',
			editPollOptionChoices: 'guest/pollOptions/EDIT_POLL_OPTION_CHOICES',
		}),
		emitGetPolls() {
			this.$socket.emit('get-polls', ({ errmsg, polls }) => {
				if (!polls) {
					if (errmsg) {
						// ...
					}
					return;
				}
				this.setPolls(polls);
				this.emitGetAllPollOptions();
			});
		},
		emitGetAllPollOptions() {
			const emiter = 'get-all-poll-options';
			this.$socket.emit(emiter, ({ errmsg, poll_options }) => {
				if (!poll_options) {
					if (errmsg) {
						this.showNotify(errmsg, 'danger');
					}
					return;
				}
				this.setPollOptions(poll_options);
				this.emitGetAllOptChoices();
			});
		},
		emitGetAllOptChoices() {
			const emiter = 'get-all-poll-option-choices';
			this.$socket.emit(emiter, ({ errmsg, choices }) => {
				if (!choices) {
					if (errmsg) {
						this.showNotify(errmsg, 'danger');
					}
					return;
				}
				// console.warn(choices);
				this.setPollOptionChoices(choices);
			});
		},
	},
};
</script>

<style>
</style>
