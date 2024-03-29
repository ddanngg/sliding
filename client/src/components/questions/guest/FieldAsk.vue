<template>
	<div>
		<div class="d-flex">
			<span
				v-t="'guest-ask-title'"
				class="ml-3 my-2 body-1 grey--text" />
			<v-spacer />
			<v-chip id="users-online" small label color="primary" text-color="white">
				<span class="font-weight-bold">
					{{ onlineUsers }}
				</span>
				<v-icon small right v-text="'$vuetify.icons.group_people'" />
			</v-chip>
		</div>
		<div id="guest-ask">
			<v-layout
				class="pt-3 px-3"
				:class="{'blur': !allowQuestion}">
				<v-expand-x-transition>
					<v-icon
						v-if="!expand"
						color="primary"
						class="pt-1 ask-icon d-block"
						v-text="'$vuetify.icons.ask_question'" />
				</v-expand-x-transition>

				<v-expand-x-transition>
					<v-textarea
						v-model="form.ask.value"
						class="custom-area-field pt-0 mt-0"
						rows="1"
						:auto-grow="true"
						:placeholder="$t('lb-question')"
						:errmsg="form.ask.errmsg"
						:disabled="!allowQuestion"
						@focus="expand=true"
						@blur="expand=false" />
				</v-expand-x-transition>
			</v-layout>
			<v-divider />
			<v-expand-transition>
				<div v-show="expand || form.ask.value !== ''">
					<v-layout
						align-center
						justify-space-between
						class="px-3 py-1"
						:class="{'blur': !allowQuestion}">
						<span class="grey--text">
							{{ countCharacters }}
						</span>
						<v-btn
							color="primary"
							small
							round
							:disabled="checkValidLength || !allowQuestion || loadingState !== ''"
							:loading="loadingState !== ''"
							@click="sendQuestion">
							<span v-t="'btn-send'" />
							<template v-slot:loader>
								<loading--icon-circle :state.sync="loadingState" />
							</template>
						</v-btn>
					</v-layout>
				</div>
			</v-expand-transition>
			<div v-if="!allowQuestion" class="question-not-allow">
				<div class="centered">
					<v-icon size="30" v-text="'$vuetify.icons.lock'" />
					<div v-t="'guest-question-disable'" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import LoadingIconCircle from '@/components/pieces/LoadingIconCircle.vue';
const askForm = () => ({
	ask: {
		value: '',
		placeholder: 'lb-question',
		rows: 2,
		maxLength: 160,
		errmsg: '',
	},
});

export default {
	name: 'FieldAsk',
	components: {
		'loading--icon-circle': LoadingIconCircle,
	},
	data: () => ({
		expand: false,
		form: askForm(),
		loadingState: '',
	}),
	computed: {
		...mapGetters({
			user: 'auth/user',
			eventInfo: 'guest/event/getEventInfo',
			allowQuestion: 'guest/event/allowQuestion',
			onlineUsers: 'guest/event/getOnlineUsers',
		}),
		checkValidLength() {
			const { ask } = this.form;
			if (ask.value && ask.value.length > ask.maxLength) {
				ask.errmsg = this.$t('err-question-limit');
				return true;
			}
			return !this._cm.notEmpty(ask.value);
		},
		countCharacters() {
			const { ask } = this.form;
			return ask.maxLength - ask.value.length;
		},
	},
	methods: {
		...mapMutations({
			addQuestion: 'guest/questions/ADD_SUCCESS_QUESTION',
		}),
		sendQuestion() {
			this.loadingState = 'loading';
			this.expand = true;
			const emiter = 'add-question';
			this.$socket.emit(emiter, {
				event_id: this.eventInfo.id,
				user_id: this.user.id,
				content: this.form.ask.value,
				stage: this.eventInfo.on_moderation ? 'private' : 'public',
			}, ({ errmsg, question }) => {
				if (!question) {
					if (errmsg) {
						this.form.ask.errmsg = errmsg;
						this.showNotify(errmsg, 'danger');
					}
					this.loadingState = 'fail';
					this.expand = false;
				}
				this.form.ask.value = '';
				this.loadingState = 'success';
				this.expand = false;
				if (this.eventInfo.on_moderation) {
					this.showNotify(this.$t('guest-question-on-moderation'));
					return;
				}
				this.addQuestion(question);
			});
		},
	},
};
</script>

<style lang="scss">
#guest-ask {
	-webkit-box-shadow: 0 1px 4px rgba(0,0,0,.2);
	-moz-box-shadow: 0 1px 4px rgba(0,0,0,.2);
	box-shadow: 0 1px 4px rgba(0,0,0,.2);
	background-color: #fff;
	position: relative;
	z-index: 1;

	.ask-icon {
		width: 40px;
	}

	.question-not-allow {
		position: absolute;
		height: 100%;
		width: 100%;
		text-align: center;
		top: 0;
		background-color: rgba(224, 224, 224, 0.14);
		z-index: 2;

		.centered {
			position: absolute;
			height: 100%;
			width: 100%;
			top: 11%;
			z-index: 4;
		}
	}

	.custom-area-field {
		.v-input__slot:after, .v-input__slot:before {
			content: none !important;
			display: none !important;
		}
	}
	.blur {
		-webkit-filter: blur(3px);
		-moz-filter: blur(3px);
		-ms-filter: blur(3px);
		-o-filter: blur(3px);
		filter: blur(3px);
	}
}
</style>
