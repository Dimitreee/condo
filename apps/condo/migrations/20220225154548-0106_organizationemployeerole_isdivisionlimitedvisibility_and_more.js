// auto generated by kmigrator
// KMIGRATOR:0106_organizationemployeerole_isdivisionlimitedvisibility_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMCBvbiAyMDIyLTAyLTI1IDEwOjQ2Cgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucywgbW9kZWxzCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMTA1X3RpY2tldF9jYW5yZWFkYnlyZXNpZGVudF9hbmRfbW9yZScpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nb3JnYW5pemF0aW9uZW1wbG95ZWVyb2xlJywKICAgICAgICAgICAgbmFtZT0naXNEaXZpc2lvbkxpbWl0ZWRWaXNpYmlsaXR5JywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChkZWZhdWx0PUZhbHNlKSwKICAgICAgICAgICAgcHJlc2VydmVfZGVmYXVsdD1GYWxzZSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J29yZ2FuaXphdGlvbmVtcGxveWVlcm9sZWhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdpc0RpdmlzaW9uTGltaXRlZFZpc2liaWxpdHknLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field isDivisionLimitedVisibility to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" ADD COLUMN "isDivisionLimitedVisibility" boolean DEFAULT false NOT NULL;
ALTER TABLE "OrganizationEmployeeRole" ALTER COLUMN "isDivisionLimitedVisibility" DROP DEFAULT;
--
-- Add field isDivisionLimitedVisibility to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" ADD COLUMN "isDivisionLimitedVisibility" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field isDivisionLimitedVisibility to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" DROP COLUMN "isDivisionLimitedVisibility" CASCADE;
--
-- Add field isDivisionLimitedVisibility to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" DROP COLUMN "isDivisionLimitedVisibility" CASCADE;
COMMIT;

    `)
}