/**
 * This file is autogenerated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; sendAt:DateTimeUtc;'`
 * In most cases you should not change it by hands. And please don't remove `AUTOGENERATE MARKER`s
 */

const { Message } = require('./Message')
const { SendMessageService } = require('./SendMessageService')
/* AUTOGENERATE MARKER <REQUIRE> */

module.exports = {
    Message,
    SendMessageService,
/* AUTOGENERATE MARKER <EXPORTS> */
}
