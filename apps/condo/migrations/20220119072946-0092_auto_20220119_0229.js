// auto generated by kmigrator
// KMIGRATOR:0092_auto_20220119_0229:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi43IG9uIDIwMjItMDEtMTkgMDI6MjkKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKaW1wb3J0IGRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24KCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwOTFfYXV0b18yMDIxMTIyOV8wNTM5JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLlJlbmFtZUZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdwdXNodG9rZW5oaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgb2xkX25hbWU9J3VzZXInLAogICAgICAgICAgICBuZXdfbmFtZT0nb3duZXInLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ncHVzaHRva2VuJywKICAgICAgICAgICAgbmFtZT0ndXNlcicsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdwdXNodG9rZW4nLAogICAgICAgICAgICBuYW1lPSdvd25lcicsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Gb3JlaWduS2V5KGJsYW5rPVRydWUsIGRiX2NvbHVtbj0nb3duZXInLCBudWxsPVRydWUsIG9uX2RlbGV0ZT1kamFuZ28uZGIubW9kZWxzLmRlbGV0aW9uLkNBU0NBREUsIHJlbGF0ZWRfbmFtZT0nKycsIHRvPSdfZGphbmdvX3NjaGVtYS51c2VyJyksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFsdGVyRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3B1c2h0b2tlbicsCiAgICAgICAgICAgIG5hbWU9J3NlcnZpY2VUeXBlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkNoYXJGaWVsZChjaG9pY2VzPVsoJ0ZpcmViYXNlJywgJ0ZpcmViYXNlJyksICgnSHVhd2VpJywgJ0h1YXdlaScpLCAoJ0FwcGxlJywgJ0FwcGxlJyldLCBtYXhfbGVuZ3RoPTUwKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Rename field user on pushtokenhistoryrecord to owner
--
ALTER TABLE "PushTokenHistoryRecord" RENAME COLUMN "user" TO "owner";
--
-- Remove field user from pushtoken
--
SET CONSTRAINTS "PushToken_user_a08ed85d_fk_User_id" IMMEDIATE; ALTER TABLE "PushToken" DROP CONSTRAINT "PushToken_user_a08ed85d_fk_User_id";
ALTER TABLE "PushToken" DROP COLUMN "user" CASCADE;
--
-- Add field owner to pushtoken
--
ALTER TABLE "PushToken" ADD COLUMN "owner" uuid NULL CONSTRAINT "PushToken_owner_95bc293c_fk_User_id" REFERENCES "User"("id") DEFERRABLE INITIALLY DEFERRED; SET CONSTRAINTS "PushToken_owner_95bc293c_fk_User_id" IMMEDIATE;
--
-- Alter field serviceType on pushtoken
--
CREATE INDEX "PushToken_owner_95bc293c" ON "PushToken" ("owner");
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field serviceType on pushtoken
--
--
-- Add field owner to pushtoken
--
ALTER TABLE "PushToken" DROP COLUMN "owner" CASCADE;
--
-- Remove field user from pushtoken
--
ALTER TABLE "PushToken" ADD COLUMN "user" uuid NULL CONSTRAINT "PushToken_user_a08ed85d_fk_User_id" REFERENCES "User"("id") DEFERRABLE INITIALLY DEFERRED; SET CONSTRAINTS "PushToken_user_a08ed85d_fk_User_id" IMMEDIATE;
--
-- Rename field user on pushtokenhistoryrecord to owner
--
ALTER TABLE "PushTokenHistoryRecord" RENAME COLUMN "owner" TO "user";
CREATE INDEX "PushToken_user_a08ed85d" ON "PushToken" ("user");
COMMIT;

    `)
}
