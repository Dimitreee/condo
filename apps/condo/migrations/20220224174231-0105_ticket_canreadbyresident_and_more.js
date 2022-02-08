// auto generated by kmigrator
// KMIGRATOR:0105_ticket_canreadbyresident_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMCBvbiAyMDIyLTAyLTI0IDEyOjQ3Cgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucywgbW9kZWxzCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMTA0X2F1dG9fMjAyMjAyMjRfMDg1MScpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ndGlja2V0JywKICAgICAgICAgICAgbmFtZT0nY2FuUmVhZEJ5UmVzaWRlbnQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGRlZmF1bHQ9RmFsc2UpLAogICAgICAgICAgICBwcmVzZXJ2ZV9kZWZhdWx0PUZhbHNlLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ndGlja2V0Y2hhbmdlJywKICAgICAgICAgICAgbmFtZT0nY2FuUmVhZEJ5UmVzaWRlbnRGcm9tJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ndGlja2V0Y2hhbmdlJywKICAgICAgICAgICAgbmFtZT0nY2FuUmVhZEJ5UmVzaWRlbnRUbycsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Cb29sZWFuRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3RpY2tldGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjYW5SZWFkQnlSZXNpZGVudCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Cb29sZWFuRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canReadByResident to ticket
--
ALTER TABLE "Ticket" ADD COLUMN "canReadByResident" boolean DEFAULT false NOT NULL;
ALTER TABLE "Ticket" ALTER COLUMN "canReadByResident" DROP DEFAULT;
--
-- Add field canReadByResidentFrom to ticketchange
--
ALTER TABLE "TicketChange" ADD COLUMN "canReadByResidentFrom" boolean NULL;
--
-- Add field canReadByResidentTo to ticketchange
--
ALTER TABLE "TicketChange" ADD COLUMN "canReadByResidentTo" boolean NULL;
--
-- Add field canReadByResident to tickethistoryrecord
--
ALTER TABLE "TicketHistoryRecord" ADD COLUMN "canReadByResident" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canReadByResident to tickethistoryrecord
--
ALTER TABLE "TicketHistoryRecord" DROP COLUMN "canReadByResident" CASCADE;
--
-- Add field canReadByResidentTo to ticketchange
--
ALTER TABLE "TicketChange" DROP COLUMN "canReadByResidentTo" CASCADE;
--
-- Add field canReadByResidentFrom to ticketchange
--
ALTER TABLE "TicketChange" DROP COLUMN "canReadByResidentFrom" CASCADE;
--
-- Add field canReadByResident to ticket
--
ALTER TABLE "Ticket" DROP COLUMN "canReadByResident" CASCADE;
COMMIT;

    `)
}