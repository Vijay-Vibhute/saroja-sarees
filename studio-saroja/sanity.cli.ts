import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '1wmevimt',
    dataset: 'production'
  },
  deployment: {
    appId: 'kyw1sm6wqrbwqvusbocdqx4z',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: false,
  }
})
