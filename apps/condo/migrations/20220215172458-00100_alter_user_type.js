// auto generated by kmigrator
// KMIGRATOR:0100_alter_user_type:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi42IG9uIDIwMjItMDItMTUgMTI6MjQKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwOThfYXV0b18yMDIyMDIwOV8xMTI3JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFsdGVyRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3VzZXInLAogICAgICAgICAgICBuYW1lPSd0eXBlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkNoYXJGaWVsZChjaG9pY2VzPVsoJ3N0YWZmJywgJ3N0YWZmJyksICgncmVzaWRlbnQnLCAncmVzaWRlbnQnKSwgKCdzZXJ2aWNlJywgJ3NlcnZpY2UnKV0sIG1heF9sZW5ndGg9NTApLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field type on user
--
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field type on user
--
COMMIT;

    `)
}
