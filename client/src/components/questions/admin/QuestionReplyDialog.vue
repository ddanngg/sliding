<template>
	<v-dialog
		id="reply-question-dialog"
		v-model="dialogReplyQuestion"
		max-width="550px"
		:transition="false"
		:fullscreen="isSMnXS">
		<v-card>
			<v-card-title class="py-0">
				<!-- @desc: show back button
									hide title in small device -->
				<template v-if="isSMnXS">
					<v-btn v-if="isSMnXS" icon @click="dialogReplyQuestion=false">
						<v-icon :size="icon.sm" v-text="'$vuetify.icons.arrow_left'" />
					</v-btn>
				</template>
				<!-- @desc: title -->
				<template v-else>
					<span v-if="!isSMnXS" v-t="'dialog-reply-question-title'" />
				</template>

				<v-spacer />

				<!-- @desc: show edit/delete/archive button
									hide close button in small device -->
				<template v-if="isSMnXS">
					<v-btn icon @click="editQuestion">
						<v-icon :size="icon.sm" v-text="'$vuetify.icons.edit'" />
					</v-btn>
					<v-btn icon @click="deleteQuestion">
						<v-icon :size="icon.sm" v-text="'$vuetify.icons.delete'" />
					</v-btn>
					<v-btn icon @click="archiveQuestion">
						<v-icon :size="icon.sm" v-text="'$vuetify.icons.archive_all'" />
					</v-btn>
				</template>
				<!-- @desc: button close -->
				<template v-else>
					<v-btn
						v-if="!isSMnXS"
						icon
						@click="dialogReplyQuestion=false">
						<v-icon
							:size="icon.sm"
							v-text="'$vuetify.icons.close'" />
					</v-btn>
				</template>
			</v-card-title>
			<v-divider />

			<!-- @desc: Replies message content -->
			<div class="max-height-sm-down">
				<div
					id="qrd"
					ref="qrd"
					v-scroll:#qrd="onScrollDialog"
					class="wrapper-card">
					<question-card--live :question="question" />
					<div class="wrapper-card--reply">
						<template v-for="reply in replies">
							<reply-card
								:key="reply.id"
								:reply-data="reply"
								@delete-reply="deleteReply(reply)"
								@edit-reply="editReply(reply)" />
						</template>
						<bouncy-loader v-if="loading" />
					</div>
				</div>

				<!-- @desc: textarea for reply -->
				<v-divider />
				<v-card-actions style="padding: 5px 24px;">
					<!-- <div @keydown.enter.capture.prevent.stop> -->
					<text-area class="field-reply"
						:field="form.reply"
						@keydown.native.enter.capture="onReplyEnter" />
					<!-- </div> -->
					<v-btn
						flat
						icon
						color="primary"
						:disabled="checkValidReply"
						@click="sendReply">
						<v-icon v-text="'$vuetify.icons.send'" />
					</v-btn>
				</v-card-actions>
			</div>
		</v-card>
	</v-dialog>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import LiveQuestionCard from './LiveQuestionCard.vue';
import QuestionReplyCard from './QuestionReplyCard.vue';

const initForm = () => ({
	reply: {
		label: 'lb-reply',
		value: '',
		prepend: 'person',
		errmsg: '',
		rows: 1,
		counter: 1000,
		autogrow: true,
		autofocus: true
	}
});

export default {
	name: 'QuestionReplyDialog',
	components: {
		'question-card--live': LiveQuestionCard,
		'reply-card': QuestionReplyCard
	},
	data: () => ({
		dialogReplyQuestion: false,
		icon: {
			sm: 20
		},
		form: initForm(),
		loading: false,
		tempReplyID: [],
		question: {
			content: '',
			count_replies: null,
			id: null,
			likes: [],
			user: {
				id: null,
				name: ''
			}
		},
		replies: [],
		autoscroll: true,
		qrd: null
	}),
	computed: {
		...mapGetters({
			getQuestionReplies: 'admin/questions/getQuestionReplies',
			user: 'auth/user'
		}),
		checkValidReply() {
			const { reply } = this.form;
			if (reply.value && reply.value.length > reply.counter) {
				reply.errmsg = this.$t('err-reply-limit');
				return true;
			}
			return !this._cm.notEmpty(reply.value);
		},
		isSMnXS() {
			return this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.xs;
		}
	},
	watch: {
		replies() {
			if (this.autoscroll) {
				this.$nextTick(this.toLatestReply);
			}
		}
	},
	mounted() {
		this.qrd = this.$refs.qrd;
		this.$root.$on('update-replies', () => {
			this.updateReplies();
		});
		this.$root.$on('dialog-reply-question', (question) => {
			this.dialogReplyQuestion = true;
			if (this.question && this.question.id === question.id) return;
			this.question = question;
			this.autoscroll = true;
			this.replies = this.question.replies || [];
			if (this.question.replies === undefined && this.question.count_replies > 0) {
				this.loading = true;
				this.emitReplies();
			}
		});
	},
	methods: {
		...mapMutations({
			mergeEditReply: 'admin/questions/MERGE_EDIT_REPLY',
			deleteQReply: 'admin/questions/DELETE_QUESTION_REPLY',
			setQReplies: 'admin/questions/SET_QUESTION_REPLIES',
			mergeQReply: 'admin/questions/MERGE_SUCCESS_QUESTION_REPLY',
			deleteErrorQReply: 'admin/questions/DELETE_ERROR_QUESTION_REPLY',
			addTempReply: 'admin/questions/ADD_TEMP_QUESTION_REPLY'
		}),
		updateReplies() {
			this.replies = this.getQuestionReplies(this.question.id);
			this._cm.customSort(this.replies, 'asc', 'created_at');
		},
		deleteReply(reply) {
			this.deleteQReply(reply);
			this.updateReplies();
		},
		editReply(reply) {
			this.mergeEditReply(reply);
		},
		toLatestReply() {
			this.qrd.scrollBy({
				top: this.qrd.scrollHeight - this.qrd.offsetHeight,
				left: 0,
				behavior: 'smooth'
			});
		},
		onScrollDialog(e) {
			const { qrd } = this.$refs;
			this.autoscroll = qrd.scrollTop + 20 > qrd.scrollHeight - qrd.offsetHeight;
		},
		onReplyEnter(e) {
			if (e && !e.shiftKey) {
				e.preventDefault();
				if (this.form.reply.value.trim() === '') {
					return;
				}
				this.sendReply();
			}
		},
		emitReplies() {
			const emiter = 'get-question-replies';
			this.$socket.emit(emiter, this.question.id, ({ errmsg, replies }) => {
				this.loading = false;
				if (errmsg) {
					// notify
					return;
				}
				const data = {
					id: this.question.id,
					replies
				};
				this.setQReplies(data);
				this.updateReplies();
			});
		},
		sendReply() {
			let key = null;
			do {
				key = Math.random().toString(36).substring(7);
			} while (this.tempReplyID.includes(key));
			this.tempReplyID.push(key);
			const replyId = key;
			const replyInfo = {
				question_id: this.question.id,
				data: {
					id: replyId,
					content: this.form.reply.value.trim(),
					question_id: this.question.id,
					created_at: new Date().toISOString(),
					user: {
						id: this.user.id,
						name: this.user.name
					}
				}
			};
			this.addTempReply(replyInfo);
			this.form.reply.value = '';
			const emiter = 'add-question-reply';
			this.$socket.emit(emiter, replyInfo.data, ({ reply, errmsg }) => {
				const infoReply = {
					question_id: this.question.id,
					temp_id: replyId
				};
				this.tempReplyID = this.tempReplyID.filter(id => id !== replyId);
				if (!reply) {
					if (errmsg) {
						this.form.reply.errmsg = errmsg;
					}
					return this.deleteErrorQReply(infoReply);
				}
				this.mergeQReply(Object.assign(reply, { temp_id: infoReply.temp_id }));
				return this.updateReplies();
			});
		},
		editQuestion() {},
		deleteQuestion() {},
		archiveQuestion() {}
	}
};
</script>

<style lang="scss">
.wrapper-card {
	position: relative !important;
	flex: 1;
	overflow-x: hidden;
	max-height: 68vh;
	.wrapper-card--reply {
		overflow-y: auto;
		position: relative !important;
		min-height: 30vh;
	}
}
.field-reply {
	textarea {
		max-height: 10vh;
	}
}

@media only screen and (max-width: 960px) {
	.wrapper-card {
		height: 90vh;
		max-height: 90vh;
		.wrapper-card--reply {
			max-height: unset;
			min-height: 50vh;
		}
	}
	.field-reply {
		textarea {
			max-height: 10vh;
		}
	}

	.max-height-sm-down {
		height: calc(100vh - 52px);
		display: flex;
		flex-direction: column;
	}
}
</style>