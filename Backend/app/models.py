from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Target(Base):
    __tablename__ = "targets"
    __table_args__ = (Index("ix_targets_active_name", "deleted_at", "name"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    base_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    environment: Mapped[str] = mapped_column(String(32), nullable=False)
    owner: Mapped[str | None] = mapped_column(String(160))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    scope: Mapped["TargetScope | None"] = relationship(back_populates="target", cascade="all, delete-orphan", uselist=False)
    assessments: Mapped[list["Assessment"]] = relationship(back_populates="target")


class TargetScope(Base):
    __tablename__ = "target_scopes"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    target_id: Mapped[UUID] = mapped_column(ForeignKey("targets.id", ondelete="CASCADE"), unique=True, nullable=False)
    allowed_domains: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    included_paths: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    excluded_paths: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    excluded_endpoints: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    allow_subdomains: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    testing_restrictions: Mapped[str] = mapped_column(Text, default="")
    authorization_confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    authorization_confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    authorization_notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    target: Mapped[Target] = relationship(back_populates="scope")


class Assessment(Base):
    __tablename__ = "assessments"
    __table_args__ = (Index("ix_assessments_target_created", "target_id", "created_at"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    target_id: Mapped[UUID] = mapped_column(ForeignKey("targets.id"), nullable=False)
    purpose: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="draft", nullable=False)
    findings_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    target: Mapped[Target] = relationship(back_populates="assessments")
    configuration: Mapped["AssessmentConfiguration | None"] = relationship(back_populates="assessment", cascade="all, delete-orphan", uselist=False)


class AssessmentConfiguration(Base):
    __tablename__ = "assessment_configurations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    assessment_id: Mapped[UUID] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), unique=True, nullable=False)
    reconnaissance_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    passive_testing_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    active_testing_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    browser_crawling_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    technology_discovery_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    configuration_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    assessment: Mapped[Assessment] = relationship(back_populates="configuration")
