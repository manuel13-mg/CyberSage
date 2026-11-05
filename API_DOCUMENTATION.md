# CyberSage API

All endpoints are under `/api/v1`.

## Targets

- `GET /targets` — paginated, searchable active targets.
- `POST /targets` — create a target and its authorization scope.
- `GET /targets/{target_id}` — target details.
- `PUT /targets/{target_id}` — update target metadata.
- `DELETE /targets/{target_id}` — archive a target; historical assessments remain.
- `GET /targets/{target_id}/scope` and `PUT /targets/{target_id}/scope` — scope configuration.

## Assessments

- `GET /assessments` — paginated assessment history.
- `POST /assessments` — create an authorized target assessment in `draft` status.
- `GET /assessments/{assessment_id}` and `PUT /assessments/{assessment_id}` — assessment details/configuration.
- `DELETE /assessments/{assessment_id}` — delete a configuration record.
- `GET /targets/{target_id}/assessments` — target history.

## Dashboard and health

- `GET /dashboard/summary` — database-backed counts; unsupported findings remain zero.
- `GET /health` — core API health, independent of optional integrations.
- `GET /components/status` — Gemini configuration presence and PostgreSQL/Neo4j connectivity status.
