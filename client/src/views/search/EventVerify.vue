<template>
	<div v-show="ready" class="text-xs-center event-verify">
		<div
			v-t="'search-verify-welcome'"
			class="first-letter-uppercase title font-weight-regular" />
		<div class="title py-2 font-weight-bold">
			{{ eventInfo.name }}
		</div>
		<div class="grey--text text--darken-1">
			{{ startDate }}
		</div>
		<div v-if="eventInfo.description !== ''" class="grey--text text--darken-1 caption pt-2">
			{{ eventInfo.description }}
		</div>
		<v-layout
			v-if="eventInfo.require_passcode"
			id="my-input-passcode"
			align-center
			justify-center
			column>
			<text-field :field="passcode" />
		</v-layout>
		<div class="mt-5">
			<v-btn
				color="success"
				medium
				round
				:disabled="eventInfo.require_passcode && passcode.value !== '' || loadingState !== ''"
				:loading="loadingState !== ''"
				@click="toJoinEvent">
				<span
					v-show="loadingState === ''"
					v-t="'btn-join'"
					class="first-letter-uppercase" />
				<template v-slot:loader>
					<icon-loading-circle :state.sync="loadingState" />
				</template>
			</v-btn>

			<v-btn
				v-if="!user"
				color="success"
				round
				flat
				medium
				outline
				@click="toLogin">
				<span v-t="'loginFormTitle'" class="first-letter-uppercase" />
			</v-btn>
		</div>

		<router-link
			tag="span"
			to="/search"
			class="grey--text text--lighten-1 caption bt-1 hover-pointer to-search">
			<span v-t="'btn-back-search'" />
		</router-link>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import IconLoadingCircle from '@/components/pieces/IconLoadingCircle.vue';

export default {
	name: 'EventVerify',
	components: {
		'icon-loading-circle': IconLoadingCircle,
	},
	data: () => ({
		eventInfo: {
			name: '',
			end_at: '2019-06-02T00:00:00.000Z',
			require_passcode: false,
			description: '',
		},
		passcode: {
			placeholder: 'lb-passcode',
			type: 'text',
			value: '',
			errmsg: '',
			inprepend: 'lock',
			autofocus: true,
		},
		ready: false,
		loadingState: '',
	}),
	computed: {
		...mapGetters({
			user: 'auth/user',
		}),
		startDate() {
			return new Date(this.eventInfo.end_at).toUTCString().toString().substr(4, 12);
		},
	},
	created() {
		if (this._cm.notEmpty(this.$route.params.eventInfo)) {
			this.ready = true;
			this.eventInfo = this.$route.params.eventInfo;
		}
		else {
			this.$router.push({ name: 'search' });
		}
	},
	methods: {
		toLogin() {
			// @params: ecfs (event code from search)
			this.$router.push({
				name: 'login',
				params: { ecfs: this.eventInfo.code },
			});
		},
		toJoinEvent() {
			if (!this.user) {
				this.quickSignup();
				return;
			}
			this.$router.push({
				name: 'guest-event',
				params: { code: this.eventInfo.code },
			});
		},
		quickSignup() {
			this.loadingState = 'loading';
			this.$axios
				.post(this.$api.auth.quickSignup, {})
				.then((res) => {
					this.$store.dispatch('auth/setAuth', res.data.user);
					this.loadingState = 'success';
					this.$router.push({
						name: 'guest-event',
						params: { code: this.eventInfo.code },
					});
				})
				.catch((err) => {
					console.warn(err);
				});
		},
	},
};
</script>

<style lang="scss">
.event-verify {
	.to-search:hover {
		color: #777777 !important;
	}
	#my-input-passcode {
		.v-input__slot {
			border-radius: 50px;
		}
	}
}
</style>