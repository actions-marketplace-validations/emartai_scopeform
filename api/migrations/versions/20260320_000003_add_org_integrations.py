"""add org_integrations table

Revision ID: 000003
Revises: 000002
Create Date: 2026-03-20
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "000003"
down_revision = "000002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "org_integrations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("org_id", sa.Uuid(), nullable=False),
        sa.Column("service", sa.String(length=64), nullable=False),
        sa.Column("encrypted_api_key", sa.String(length=1024), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["org_id"], ["organisations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("org_id", "service", name="uq_org_integration_service"),
    )
    op.create_index("ix_org_integrations_org_id", "org_integrations", ["org_id"])


def downgrade() -> None:
    op.drop_index("ix_org_integrations_org_id", table_name="org_integrations")
    op.drop_table("org_integrations")
