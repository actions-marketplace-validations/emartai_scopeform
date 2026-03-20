from __future__ import annotations

from pydantic import BaseModel


class IntegrationUpsertRequest(BaseModel):
    api_key: str


class IntegrationResponse(BaseModel):
    service: str
    configured: bool
    updated_at: str | None = None


class IntegrationListResponse(BaseModel):
    items: list[IntegrationResponse]
