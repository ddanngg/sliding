<template>
	<v-expansion-panel v-model="panel" expand>
		<v-expansion-panel-content>
			<!-- header expand -->
			<template v-slot:header>
				<v-list dense>
					<v-list-tile class="grow">
						<!-- icon -->
						<v-list-tile-avatar>
							<v-icon
								color="primary"
								size="20"
								v-text="`$vuetify.icons.${info.icon}`" />
						</v-list-tile-avatar>

						<v-list-tile-content class="primary--text body-2  font-weight-medium w-100">
							<!-- main title -->
							<v-list-tile-title v-text="$t(info.title)" />

							<!-- subtitle translate -->
							<v-list-tile-sub-title class="hide-subtitle" v-text="$t(info.subtitle)" />

							<!-- for subtitle text -->
							<slot name="subtitle-text" />
						</v-list-tile-content>

						<!-- button switch -->
						<slot name="switch-on-title" />
					</v-list-tile>
				</v-list>
			</template>

			<!-- arrow -->
			<template v-slot:actions>
				<v-icon color="primary" v-text="'keyboard_arrow_down'" />
			</template>

			<!-- settings content -->
			<v-card flat>
				<v-card-text flat class="pt-0">
					<v-layout row wrap justify-center align-center>
						<v-flex xs10 offset-xs1 offset-sm0 offset-md1>
							<slot name="content" />
						</v-flex>
					</v-layout>
				</v-card-text>
			</v-card>
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>

<script>
export default {
	name: 'EventSettingExpand',
	props: {
		info: {
			type: Object,
			default() {
				return {
					icon: '',
					title: '',
					subtitle: '',
				};
			},
		},
	},
	data: () => ({
		panel: [true],
	}),
};
</script>

<style>
</style>
