<template>
	<v-content id="auth-page">
		<span v-show="false">
			{{ $t('FOR_A_PURPOSE') }}
		</span>
		<v-container
			fluid
			fill-height>
			<v-layout
				row
				align-center
				justify-center>
				<v-card class="auth-card py-4 elevation-20">
					<v-slide-y-transition mode="out-in">
						<router-view />
					</v-slide-y-transition>
					<div class="my-2 text-xs-center">
						<router-link
							class="no-underline back-home caption grey--text text--lighten-2"
							:to="{ name: 'home' }">
							<span v-t="'btn-back-home'" class="font-weight-regular caption" />
						</router-link>
					</div>
				</v-card>
			</v-layout>
		</v-container>
	</v-content>
</template>

<script>
export default {};
</script>

<style lang="scss">
#auth-page {
	#login-form .v-card__text, #signup-form .v-card__text {
		padding: 0 45px;
	}
	.back-home:hover.text--lighten-2, .login-mrs:hover {
		color: var(--v-grey-darken3) !important;
	}
	.auth-card {
		width: 100%;
		max-width: 500px;
		height: auto;
	}
	background: url(~@/assets/auth_bg.jpg);
	background-size: cover;
	background-repeat:no-repeat;
	background-position: center;

	@media (max-width: 479px) {
		.fluid {
			padding: 0 !important;
		}
		.auth-card {
			height: 100%;
		}
	}
	@media only screen and (min-width: 960px) {
		.fluid, .v-card {
			padding: 5px !important;
		}
	}
}
</style>
