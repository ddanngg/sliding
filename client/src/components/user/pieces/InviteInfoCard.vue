<template>
	<v-card class="no-shadow pb-2">
		<v-layout row>
			<!-- *Event infomation -->
			<v-layout justify-start>
				<div>
					<div>
						<span class="title font-weight-regular" v-text="inviteInfo.event.name" />
						<span class="grey--text text-capitalize">
							&nbsp;({{ inviteInfo.role }})
						</span>
					</div>
					<div class="grey--text text--lighten-1 text-uppercase">
						# {{ inviteInfo.event.code }}
					</div>
					<div class="grey--text">
						<v-tooltip top>
							<template v-slot:activator="{ on }">
								<span v-on="on">
									<v-icon small v-text="'$vuetify.icons.time_start'" />
									{{ formatTimeEvent(inviteInfo.event.start_at) }}
								</span>
							</template>
							<span v-t="'event-start-date'" />
						</v-tooltip>
					</div>
					<div class="grey--text">
						<v-tooltip bottom>
							<template v-slot:activator="{ on }">
								<span v-on="on">
									<v-icon small v-text="'$vuetify.icons.time_end'" />
									{{ formatTimeEvent(inviteInfo.event.end_at) }}
								</span>
							</template>
							<span v-t="'event-end-date'" />
						</v-tooltip>
					</div>
				</div>
			</v-layout>

			<!-- *Accept / Reject invite -->
			<v-layout column align-end>
				<template v-if="inviteInfo.is_accepted === null">
					<v-btn
						flat
						small
						round
						color="success"
						:disabled="loading"
						@click="emitReponseInvite(true)">
						<span v-t="'btn-accept'" class="first-letter-uppercase" />
					</v-btn>
					<v-btn
						flat
						small
						round
						color="red"
						:disabled="loading"
						@click="emitReponseInvite(false)">
						<span v-t="'btn-reject'" class="first-letter-uppercase" />
					</v-btn>
				</template>
				<template v-else-if="inviteInfo.is_accepted === true">
					<v-btn
						flat
						round
						outline
						small
						color="success">
						<span
							v-t="'btn-join'"
							class="no-underline first-letter-uppercase success--text"
							@click="toJointEvent" />
					</v-btn>
				</template>
				<template v-else>
					<span
						v-t="'invite-rejected'"
						class="caption font-weight-medium grey--text text--lighten-2 pr-2 text-xs-right" />
					<v-btn
						flat
						round
						outline
						small
						color="grey lighten-2">
						<router-link
							v-t="'btn-join-as-guest'"
							class="no-underline first-letter-uppercase grey--text"
							:to="{ name: 'guest-event', params: { code: inviteInfo.event.code } }" />
					</v-btn>
				</template>
			</v-layout>
		</v-layout>
	</v-card>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
	name: 'InviteInfoCard',
	props: {
		inviteInfo: {
			type: Object,
			default: () => ({
				is_accepted: null,
				role: 'Moderator',
				event_id: null,
				event: {
					name: '...',
					code: '...',
					start_at: '2019-07-20T16:35:42.147Z',
					end_at: '2019-07-20T16:35:42.147Z',
					descriptions: '...',
				},
			}),
		},
	},
	data: () => ({
		loading: false,
	}),
	methods: {
		...mapMutations({
			mergeInvite: 'dashboard/MERGE_RESPONSE_INVITE',
		}),
		formatTimeEvent(datetime) {
			const parseDate = new Date(datetime);
			const time = parseDate.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
			const date = parseDate.toUTCString().toString().substr(4, 12);
			return `${time} | ${date}`;
		},
		toJointEvent() {
			const currentRouteParams = this.$route.params;
			this.$router.push({ name: 'admin-event', params: { code: this.inviteInfo.event.code } });
			if (currentRouteParams.code !== undefined
				&& currentRouteParams.code !== this.inviteInfo.event.code) {
				this.$router.go();
			}
		},
		emitReponseInvite(asw) {
			const emiter = 'response-invited';
			const response = {
				event_id: this.inviteInfo.event_id,
				is_accepted: asw,
			};
			this.loading = true;
			this.$socket.emit(emiter, response, ({ errmsg, role }) => {
				this.loading = false;
				if (!role) {
					if (errmsg) {
						this.showNotify(errmsg, 'danger');
					}
					return;
				}
				this.mergeInvite(role);
			});
		},
	},
};
</script>

<style lang="css" scoped>
</style>
