/**
 * Generated by `createservice ticket.PredictTicketClassificationService --type queries`
 */
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canPredictTicketClassification ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    return true
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canPredictTicketClassification,
}