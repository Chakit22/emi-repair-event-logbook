# Next Steps

1. Persist repair events through an API and database.
   Store events centrally so repair history survives refreshes, device changes, and supervisor handover.
2. Add audited correction entries instead of direct editing.
   Keep the log append-only while still allowing technicians or supervisors to record mistakes and corrections.
3. Add role-based permissions for technicians and supervisors.
   Limit capture actions to technicians and review/admin actions to supervisors based on authenticated roles.
4. Extract reusable event-log primitives if another EMI workflow needs the same pattern.
   Pull shared timeline, annotation, and metric patterns into reusable components only once another workflow proves the need.
5. Implement v2 media capture for photos and audio.
   Add file/audio upload with timestamps and operator attribution so media evidence becomes part of the same event stream.
