"""Create Phase 2 target and assessment tables."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_phase2_foundation"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "targets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("base_url", sa.String(length=2048), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("environment", sa.String(length=32), nullable=False),
        sa.Column("owner", sa.String(length=160), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_targets_active_name", "targets", ["deleted_at", "name"])
    op.create_table(
        "target_scopes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("target_id", sa.Uuid(), nullable=False),
        sa.Column("allowed_domains", sa.JSON(), nullable=False),
        sa.Column("included_paths", sa.JSON(), nullable=False),
        sa.Column("excluded_paths", sa.JSON(), nullable=False),
        sa.Column("excluded_endpoints", sa.JSON(), nullable=False),
        sa.Column("allow_subdomains", sa.Boolean(), nullable=False),
        sa.Column("testing_restrictions", sa.Text(), nullable=False),
        sa.Column("authorization_confirmed", sa.Boolean(), nullable=False),
        sa.Column("authorization_confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("authorization_notes", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["target_id"], ["targets.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("target_id"),
    )
    op.create_table(
        "assessments",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("target_id", sa.Uuid(), nullable=False),
        sa.Column("purpose", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("findings_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["target_id"], ["targets.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_assessments_target_created", "assessments", ["target_id", "created_at"])
    op.create_table(
        "assessment_configurations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("assessment_id", sa.Uuid(), nullable=False),
        sa.Column("reconnaissance_enabled", sa.Boolean(), nullable=False),
        sa.Column("passive_testing_enabled", sa.Boolean(), nullable=False),
        sa.Column("active_testing_enabled", sa.Boolean(), nullable=False),
        sa.Column("browser_crawling_enabled", sa.Boolean(), nullable=False),
        sa.Column("technology_discovery_enabled", sa.Boolean(), nullable=False),
        sa.Column("configuration_json", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["assessment_id"], ["assessments.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("assessment_id"),
    )


def downgrade() -> None:
    op.drop_table("assessment_configurations")
    op.drop_index("ix_assessments_target_created", table_name="assessments")
    op.drop_table("assessments")
    op.drop_table("target_scopes")
    op.drop_index("ix_targets_active_name", table_name="targets")
    op.drop_table("targets")
