<template>
	<v-menu
		id="my-avatar"
		transition="slide-y-transition"
		bottom
		left
		offset-y
		:nudge-width="250"
		nudge-bottom="5"
		content-class="dropdown-menu">
		<!-- Avatar Actions List -->
		<span v-show="false">
			{{ $t('FOR_A_PURPOSE') }}
		</span>
		<template v-slot:activator="{ on }">
			<v-avatar class="hover-pointer" :class="{ 'ml-2': !inSearch }" v-on="on">
				<v-icon v-show="inviteNotResponsed" id="badge" dark size="12">
					notifications
				</v-icon>
				<v-icon
					size="20"
					:color="_cm.resultColor(inSearch, 'grey', 'white')"
					v-text="'$vuetify.icons.person'" />
			</v-avatar>
		</template>

		<v-layout
			class="fill-height"
			column>
			<v-card>
				<v-list>
					<!-- *Edit profile -->
					<v-list-tile>
						<v-list-tile-avatar size="30">
							<v-icon class="pl-1" size="20" v-text="'$vuetify.icons.person'" />
						</v-list-tile-avatar>

						<v-list-tile-content>
							<v-list-tile-title class="body-1 text-capitalize">
								{{ user ? user.name : '' }}
							</v-list-tile-title>
							<v-list-tile-sub-title class="caption grey--text">
								{{ user ? user.email : $t('anonymous-empty-email') }}
							</v-list-tile-sub-title>
						</v-list-tile-content>

						<v-list-tile-action v-if="!inSearch">
							<v-btn icon @click="toggleDialogUserUpdateProfile">
								<span
									v-t="'btn-edit-profile'"
									class="primary--text" />
							</v-btn>
						</v-list-tile-action>
					</v-list-tile>
				</v-list>
				<v-divider />

				<v-list dense class="pa-0">
					<!-- *Homepage -->
					<v-list-tile to="/">
						<v-list-tile-action>
							<v-icon
								class="pl-2"
								color="secondary"
								size="20"
								v-text="'$vuetify.icons.home'" />
						</v-list-tile-action>

						<v-list-tile-title v-t="'home-page'" />
					</v-list-tile>

					<!-- *Event -->
					<v-list-tile :to="{ name: 'my-events' }">
						<v-list-tile-action>
							<v-icon
								class="pl-2"
								color="primary"
								size="20"
								v-text="'$vuetify.icons.event'" />
						</v-list-tile-action>

						<v-list-tile-title v-t="'my-events'" />
					</v-list-tile>

					<!-- *Button for toggle diaog create event -->
					<v-list-tile v-if="!inSearch" @click="toggleDialogCreateEvent">
						<v-list-tile-action>
							<v-icon
								class="pl-2"
								color="yellow"
								size="20"
								v-text="'$vuetify.icons.add'" />
						</v-list-tile-action>

						<v-list-tile-title v-t="'btn-create-event'" />
					</v-list-tile>

					<!-- *Coop-event -->
					<v-list-tile :to="{ name: 'coop-events' }">
						<v-list-tile-action>
							<v-icon
								class="pl-2"
								color="success"
								size="20"
								v-text="'$vuetify.icons.group_people'" />
						</v-list-tile-action>

						<v-list-tile-title v-t="'coop-events'" />
					</v-list-tile>

					<v-divider />
					<!-- *Invite-access-request -->
					<list-item--invites v-if="!inSearch" :user="user" in-avatar />

					<!-- *Search -->
					<v-list-tile :to="{ name: 'search' }">
						<v-list-tile-action>
							<v-icon
								class="pl-2"
								size="20"
								v-text="'$vuetify.icons.search'" />
						</v-list-tile-action>

						<v-list-tile-title v-t="'btn-search-event'" />
					</v-list-tile>

					<!-- *Switch language: Vietnamese -->
					<v-list-tile @click="changeLocale('vi')">
						<v-list-tile-action>
							<v-icon
								v-show="locale === 'vi'"
								:color="locale === 'vi' ? 'primary' : ''"
								class="pl-2"
								size="20"
								v-text="'$vuetify.icons.language'" />
						</v-list-tile-action>

						<v-list-tile-content>
							<v-list-tile-title
								v-t="'lang-choose-vi'"
								:class="locale === 'vi' ? 'primary--text' : ''" />
						</v-list-tile-content>
					</v-list-tile>

					<!-- *Switch language: English -->
					<v-list-tile @click="changeLocale('en')">
						<v-list-tile-action>
							<v-icon
								v-show="locale === 'en'"
								:color="locale === 'en' ? 'primary' : ''"
								class="pl-2"
								size="20"
								v-text="'$vuetify.icons.language'" />
						</v-list-tile-action>

						<v-list-tile-content>
							<v-list-tile-title
								v-t="'lang-choose-en'"
								:class="locale === 'en' ? 'primary--text' : ''" />
						</v-list-tile-content>
					</v-list-tile>

					<!-- *Logout -->
					<v-divider />
					<v-list-tile :to="{ name: 'logout' }">
						<v-list-tile-action>
							<v-icon
								class="pl-2"
								size="20"
								v-text="'$vuetify.icons.signout'" />
						</v-list-tile-action>

						<v-list-tile-title v-t="'logout'" />
					</v-list-tile>
				</v-list>
			</v-card>
		</v-layout>
	</v-menu>
</template>

<script>
import { mapGetters } from 'vuex';
import { loadLanguageAsync } from '@/modules/vue-i18n-setup';
import InviteListItem from '@/components/pieces/InviteListItem.vue';

export default {
	name: 'UserActionsAvatar',
	components: {
		'list-item--invites': InviteListItem,
	},
	props: {
		inSearch: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		...mapGetters({
			user: 'auth/user',
			invites: 'dashboard/getInvites',
		}),
		locale() {
			return this.$i18n.locale;
		},
		inviteNotResponsed() {
			return this.invites.some(el => el.is_accepted === null);
		},
	},
	methods: {
		changeLocale(locale) {
			loadLanguageAsync(locale);
		},
		toggleDialogCreateEvent() {
			this.$root.$emit('dialog-create-new-event');
		},
		toggleDialogUserUpdateProfile() {
			this.$root.$emit('dialog-user-update-profile');
		},
	},
};
</script>

<style lang="css">
i#badge {
	position: absolute;
	top: -8px;
	right: -10px;
	color: #f50000d1;
	transform: rotate(-31deg);
}
</style>
