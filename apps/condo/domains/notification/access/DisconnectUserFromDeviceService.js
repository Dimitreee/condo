/**
 * Generated by `createservice notification.DisconnectUserFromDeviceService --type mutations`
 */
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
async function canDisconnectUserFromDevice ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canDisconnectUserFromDevice,
}