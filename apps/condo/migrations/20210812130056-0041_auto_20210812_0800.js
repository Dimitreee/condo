// auto generated by kmigrator
// KMIGRATOR:0041_auto_20210812_0800:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi41IG9uIDIwMjEtMDgtMTIgMDg6MDAKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwNDBfYXV0b18yMDIxMDgxMV8xMjQxJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFsdGVyRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J29yZ2FuaXphdGlvbmVtcGxveWVlJywKICAgICAgICAgICAgbmFtZT0naWQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVVVJREZpZWxkKHByaW1hcnlfa2V5PVRydWUsIHNlcmlhbGl6ZT1GYWxzZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFsdGVyRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J29yZ2FuaXphdGlvbmVtcGxveWVlJywKICAgICAgICAgICAgbmFtZT0nbmV3SWQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVVVJREZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFsdGVyRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J29yZ2FuaXphdGlvbmVtcGxveWVlaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2hpc3RvcnlfaWQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVVVJREZpZWxkKGRiX2luZGV4PVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;

    CREATE EXTENSION if not exists "uuid-ossp";

    --
    -- id -> old_id
    --
    ALTER TABLE "OrganizationEmployee" RENAME COLUMN id TO old_id;
    ALTER TABLE "OrganizationEmployee" ADD COLUMN id UUID NULL;
    -- id -> id = uuid
    UPDATE "OrganizationEmployee" SET id = uuid_generate_v4();
    
    -- history_id -> old_history_id
    ALTER TABLE "OrganizationEmployeeHistoryRecord" RENAME COLUMN history_id TO old_history_id;
    -- +history_id
    ALTER TABLE "OrganizationEmployeeHistoryRecord" ADD COLUMN history_id UUID NULL;
    
    -- OrganizationEmployeeHistoryRecord.history_id = OrganizationEmployee.id where OrganizationEmployee.old_id = OrganizationEmployeeHistoryRecord.old_history_id
    UPDATE "OrganizationEmployeeHistoryRecord" hr
    SET history_id = e.id
    FROM "OrganizationEmployee" as e
    WHERE(
      e.old_id = hr.old_history_id
    );
    ALTER TABLE "OrganizationEmployeeHistoryRecord" ALTER COLUMN history_id SET NOT NULL;

    --
    -- newId -> old_newId
    --
    ALTER TABLE "OrganizationEmployee" RENAME COLUMN newId TO old_newId;
    ALTER TABLE "OrganizationEmployee" ADD COLUMN newId UUID NULL;

    COMMIT;
    END;
    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;

    ALTER TABLE "OrganizationEmployee" DROP COLUMN id;
    ALTER TABLE "OrganizationEmployee" RENAME COLUMN old_id TO id;
    ALTER TABLE "OrganizationEmployee" RENAME COLUMN id SET NOT NULL;
    
    ALTER TABLE "OrganizationEmployeeHistoryRecord" DROP COLUMN history_id;
    ALTER TABLE "OrganizationEmployeeHistoryRecord" RENAME COLUMN old_history_id TO history_id;
    ALTER TABLE "OrganizationEmployeeHistoryRecord" ALTER COLUMN history_id SET NOT NULL;


    ALTER TABLE "OrganizationEmployee" DROP COLUMN newId;
    ALTER TABLE "OrganizationEmployee" RENAME COLUMN old_newId TO newId;
    ALTER TABLE "OrganizationEmployee" ALTER COLUMN newId SET NOT NULL;


    COMMIT;
    END;
    `)
}
