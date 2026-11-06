from app.workflows.profiles import dependencies, profile_definition


def test_profiles_have_ordered_stage_dependencies() -> None:
    definition = profile_definition("standard")

    assert definition["stages"][0] == "scope_validation"
    assert dependencies("vulnerability_scanning") == (
        "scope_validation", "assessment_initialization", "reconnaissance",
    )


def test_unknown_profile_is_rejected() -> None:
    try:
        profile_definition("missing")
    except ValueError as exc:
        assert "Unknown workflow profile" in str(exc)
    else:
        raise AssertionError("Expected unknown profile failure")
