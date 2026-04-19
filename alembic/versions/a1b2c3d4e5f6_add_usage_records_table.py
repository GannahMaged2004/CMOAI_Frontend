"""add usage_records table

Revision ID: a1b2c3d4e5f6
Revises: 365be9d4ac7c
Create Date: 2026-04-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "365be9d4ac7c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "usage_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("ai_generations_used", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("active_campaigns_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("storage_used_gb", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("period_month", sa.Integer(), nullable=False),
        sa.Column("period_year", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id", "period_month", "period_year", name="uq_usage_user_period"
        ),
    )
    op.create_index(op.f("ix_usage_records_id"), "usage_records", ["id"], unique=False)
    op.create_index(
        op.f("ix_usage_records_user_id"), "usage_records", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_usage_records_period_month"), "usage_records", ["period_month"], unique=False
    )
    op.create_index(
        op.f("ix_usage_records_period_year"), "usage_records", ["period_year"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_usage_records_period_year"), table_name="usage_records")
    op.drop_index(op.f("ix_usage_records_period_month"), table_name="usage_records")
    op.drop_index(op.f("ix_usage_records_user_id"), table_name="usage_records")
    op.drop_index(op.f("ix_usage_records_id"), table_name="usage_records")
    op.drop_table("usage_records")
