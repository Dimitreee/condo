/**
 * Generated by `createservice notification.SyncDeviceService --type mutations`
 */

/**
 * Manages SyncDeviceService access rights
 * Service can be accessed by both unauthorized and authorized users in different scenarios,
 * that are managed within service itself, in order to not duplicate operation type detection heuristics logic
 * @returns {Promise<boolean>}
 */
async function canSyncDevice ({ args: { data } }) {
    if (!data.deviceId) return false

    return true
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canSyncDevice,
}