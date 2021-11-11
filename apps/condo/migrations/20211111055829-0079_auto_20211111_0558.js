// auto generated by kmigrator
// KMIGRATOR:0079_auto_20211111_0558:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi44IG9uIDIwMjEtMTEtMTEgMDU6NTgKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKaW1wb3J0IGRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24KCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwNzdfYXV0b18yMDIxMTEwOV8wNzQ4JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdhY3F1aXJpbmdpbnRlZ3JhdGlvbicsCiAgICAgICAgICAgIG5hbWU9J2V4cGxpY2l0RmVlRGlzdHJpYnV0aW9uU2NoZW1hJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkpTT05GaWVsZChkZWZhdWx0PVtdKSwKICAgICAgICAgICAgcHJlc2VydmVfZGVmYXVsdD1GYWxzZSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2FjcXVpcmluZ2ludGVncmF0aW9uY29udGV4dCcsCiAgICAgICAgICAgIG5hbWU9J2ltcGxpY2l0RmVlRGlzdHJpYnV0aW9uU2NoZW1hJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkpTT05GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYWNxdWlyaW5naW50ZWdyYXRpb25jb250ZXh0aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2ltcGxpY2l0RmVlRGlzdHJpYnV0aW9uU2NoZW1hJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkpTT05GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYWNxdWlyaW5naW50ZWdyYXRpb25oaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nZXhwbGljaXRGZWVEaXN0cmlidXRpb25TY2hlbWEnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFsdGVyRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3BheW1lbnQnLAogICAgICAgICAgICBuYW1lPSdjb250ZXh0JywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkZvcmVpZ25LZXkoZGJfY29sdW1uPSdjb250ZXh0JywgbnVsbD1UcnVlLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5QUk9URUNULCByZWxhdGVkX25hbWU9JysnLCB0bz0nX2RqYW5nb19zY2hlbWEuYWNxdWlyaW5naW50ZWdyYXRpb25jb250ZXh0JyksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field explicitFeeDistributionSchema to acquiringintegration
--
ALTER TABLE "AcquiringIntegration" ADD COLUMN "explicitFeeDistributionSchema" jsonb DEFAULT '[]' NOT NULL;
ALTER TABLE "AcquiringIntegration" ALTER COLUMN "explicitFeeDistributionSchema" DROP DEFAULT;
--
-- Add field implicitFeeDistributionSchema to acquiringintegrationcontext
--
ALTER TABLE "AcquiringIntegrationContext" ADD COLUMN "implicitFeeDistributionSchema" jsonb NULL;
--
-- Add field implicitFeeDistributionSchema to acquiringintegrationcontexthistoryrecord
--
ALTER TABLE "AcquiringIntegrationContextHistoryRecord" ADD COLUMN "implicitFeeDistributionSchema" jsonb NULL;
--
-- Add field explicitFeeDistributionSchema to acquiringintegrationhistoryrecord
--
ALTER TABLE "AcquiringIntegrationHistoryRecord" ADD COLUMN "explicitFeeDistributionSchema" jsonb NULL;
--
-- Alter field context on payment
--
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field context on payment
--
--
-- Add field explicitFeeDistributionSchema to acquiringintegrationhistoryrecord
--
ALTER TABLE "AcquiringIntegrationHistoryRecord" DROP COLUMN "explicitFeeDistributionSchema" CASCADE;
--
-- Add field implicitFeeDistributionSchema to acquiringintegrationcontexthistoryrecord
--
ALTER TABLE "AcquiringIntegrationContextHistoryRecord" DROP COLUMN "implicitFeeDistributionSchema" CASCADE;
--
-- Add field implicitFeeDistributionSchema to acquiringintegrationcontext
--
ALTER TABLE "AcquiringIntegrationContext" DROP COLUMN "implicitFeeDistributionSchema" CASCADE;
--
-- Add field explicitFeeDistributionSchema to acquiringintegration
--
ALTER TABLE "AcquiringIntegration" DROP COLUMN "explicitFeeDistributionSchema" CASCADE;
COMMIT;

    `)
}