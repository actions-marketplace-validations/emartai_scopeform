from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from api.core.database import Base


class OrgIntegration(Base):
    __tablename__ = "org_integrations"
    __table_args__ = (
        UniqueConstraint("org_id", "service", name="uq_org_integration_service"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    org_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organisations.id", ondelete="CASCADE"), index=True
    )
    service: Mapped[str] = mapped_column(String(64))
    encrypted_api_key: Mapped[str] = mapped_column(String(1024))
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC)
    )
