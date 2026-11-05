from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field, field_validator


class EnvironmentType(StrEnum):
    development = "development"
    testing = "testing"
    staging = "staging"
    production = "production"
    local_lab = "local_lab"


class ScopeInput(BaseModel):
    allowed_domains: list[str] = Field(default_factory=list)
    included_paths: list[str] = Field(default_factory=list)
    excluded_paths: list[str] = Field(default_factory=list)
    excluded_endpoints: list[str] = Field(default_factory=list)
    allow_subdomains: bool = False
    testing_restrictions: str = ""
    authorization_confirmed: bool = False
    authorization_notes: str = ""


class TargetCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    base_url: AnyHttpUrl
    description: str = ""
    environment: EnvironmentType
    owner: str | None = Field(default=None, max_length=160)
    enabled: bool = True
    scope: ScopeInput

    @field_validator("base_url")
    @classmethod
    def normalize_base_url(cls, value: AnyHttpUrl) -> AnyHttpUrl:
        if value.scheme not in {"http", "https"}:
            raise ValueError("Only HTTP and HTTPS URLs are supported")
        return value


class TargetUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    base_url: AnyHttpUrl | None = None
    description: str | None = None
    environment: EnvironmentType | None = None
    owner: str | None = Field(default=None, max_length=160)
    enabled: bool | None = None


class ScopeResponse(ScopeInput):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    target_id: UUID
    authorization_confirmed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class TargetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    base_url: str
    description: str
    environment: EnvironmentType
    owner: str | None
    enabled: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
    scope: ScopeResponse | None
    assessment_count: int = 0


class AssessmentConfigurationInput(BaseModel):
    reconnaissance_enabled: bool = True
    passive_testing_enabled: bool = True
    active_testing_enabled: bool = False
    browser_crawling_enabled: bool = False
    technology_discovery_enabled: bool = True
    configuration_json: dict = Field(default_factory=dict)

    @classmethod
    def from_model(cls, value: object) -> "AssessmentConfigurationInput":
        return cls(
            reconnaissance_enabled=getattr(value, "reconnaissance_enabled"),
            passive_testing_enabled=getattr(value, "passive_testing_enabled"),
            active_testing_enabled=getattr(value, "active_testing_enabled"),
            browser_crawling_enabled=getattr(value, "browser_crawling_enabled"),
            technology_discovery_enabled=getattr(value, "technology_discovery_enabled"),
            configuration_json=getattr(value, "configuration_json"),
        )


class AssessmentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str = ""
    target_id: UUID
    purpose: str = ""
    configuration: AssessmentConfigurationInput = Field(default_factory=AssessmentConfigurationInput)


class AssessmentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    purpose: str | None = None
    status: str | None = None
    configuration: AssessmentConfigurationInput | None = None


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    description: str
    target_id: UUID
    purpose: str
    status: str
    findings_count: int
    created_at: datetime
    updated_at: datetime
    configuration: AssessmentConfigurationInput | None
    target_name: str | None = None

    @classmethod
    def from_model(cls, value: object) -> "AssessmentResponse":
        return cls(
            id=getattr(value, "id"),
            name=getattr(value, "name"),
            description=getattr(value, "description"),
            target_id=getattr(value, "target_id"),
            purpose=getattr(value, "purpose"),
            status=getattr(value, "status"),
            findings_count=getattr(value, "findings_count"),
            created_at=getattr(value, "created_at"),
            updated_at=getattr(value, "updated_at"),
            configuration=AssessmentConfigurationInput.from_model(getattr(value, "configuration")) if getattr(value, "configuration") else None,
            target_name=getattr(getattr(value, "target", None), "name", None),
        )


class Page(BaseModel):
    items: list
    total: int
    page: int
    page_size: int


class DashboardSummary(BaseModel):
    total_targets: int
    active_assessments: int
    open_findings: int
    critical_exposure: int
    latest_assessment: AssessmentResponse | None
