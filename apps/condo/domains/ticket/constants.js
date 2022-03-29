/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; classifier:Relationship:TicketClassifier:PROTECT; details:Text; meta?:Json;`
 */

const NEW_OR_REOPENED_STATUS_TYPE = 'new_or_reopened'
const PROCESSING_STATUS_TYPE = 'processing'
const CANCELED_STATUS_TYPE = 'canceled'
const COMPLETED_STATUS_TYPE = 'completed'
const DEFERRED_STATUS_TYPE = 'deferred'
const CLOSED_STATUS_TYPE = 'closed'

const TICKET_STATUS_TYPES = [
    NEW_OR_REOPENED_STATUS_TYPE,
    PROCESSING_STATUS_TYPE,
    CANCELED_STATUS_TYPE,
    COMPLETED_STATUS_TYPE,
    DEFERRED_STATUS_TYPE,
    CLOSED_STATUS_TYPE,
]

const REVIEW_VALUES = {
    BAD: 'bad',
    GOOD: 'good',
    RETURN: 'returned',
}

/*
    To keep everything, we have a `TicketChangeHistoryRecord`, being created by `historical` Keystone plugin for a `Ticket`.
    `TicketChange` – is a feature for an end user and data, that makes sense for end user is kept tracked.
    For example, `senderFrom` and `senderTo` is not needed in `TicketChange`, because `TicketChange` itself
    has `sender` field, which gets a value of `updatedItem.sender`.
    `createdAt` and `createdBy` will not be changed ever.
    `updatedAt` and `updatedBy` are presented in `TicketChange` itself, — we will know, who made a change in question.
    `v` — it seems to me, that there is no cases of using the change history of this field, it will just be incremented on every update, so, we can get final value from related `Ticket`, or just count back by number of TicketChanges. For example, when we are inspecting 5-th `TicketChange`, it will reflect state of Ticket of version 5+1.
    `dv` – is a technical thing, not a data for business-cases.
    `sender` is an internal field, that don't need to be displayed in UI.
    Because of current implementation, it's impossible to obtain some fields, created by plugins,
    at declaration stage of `TicketChange`.
 */
// TODO(AntonAL) add files to trackable - files are now in hidden relation
const OMIT_TICKET_CHANGE_TRACKABLE_FIELDS = ['v', 'dv', 'sender', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'statusUpdatedAt', 'classifierRule']

module.exports = {
    NEW_OR_REOPENED_STATUS_TYPE,
    PROCESSING_STATUS_TYPE,
    CANCELED_STATUS_TYPE,
    COMPLETED_STATUS_TYPE,
    DEFERRED_STATUS_TYPE,
    CLOSED_STATUS_TYPE,
    TICKET_STATUS_TYPES,
    OMIT_TICKET_CHANGE_TRACKABLE_FIELDS,
    REVIEW_VALUES,
}
