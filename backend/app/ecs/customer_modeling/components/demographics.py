"""
Customer demographics component for ECS customer modeling.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional


class Gender(str, Enum):
    """Gender options."""

    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class IncomeBracket(str, Enum):
    """Income bracket options."""

    LOW = "low"  # < $30k
    MEDIUM = "medium"  # $30k - $75k
    HIGH = "high"  # $75k - $150k
    VERY_HIGH = "very_high"  # > $150k


class EducationLevel(str, Enum):
    """Education level options."""

    HIGH_SCHOOL = "high_school"
    ASSOCIATE = "associate"
    BACHELOR = "bachelor"
    MASTER = "master"
    PHD = "phd"
    PROFESSIONAL = "professional"


class FamilyStatus(str, Enum):
    """Family status options."""

    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"
    SEPARATED = "separated"
    PARTNERED = "partnered"


class CompanySize(str, Enum):
    """Company size options."""

    STARTUP = "startup"  # 1-10 employees
    SMALL = "small"  # 11-50 employees
    MEDIUM = "medium"  # 51-200 employees
    LARGE = "large"  # 201-1000 employees
    ENTERPRISE = "enterprise"  # 1000+ employees


@dataclass
class Demographics:
    """Customer demographics component."""

    # Basic Demographics
    age: Optional[int] = None
    gender: Optional[Gender] = None

    # Location
    location_country: Optional[str] = None
    location_region: Optional[str] = None
    location_city: Optional[str] = None
    timezone: Optional[str] = None

    # Socioeconomic
    income_bracket: Optional[IncomeBracket] = None
    education_level: Optional[EducationLevel] = None
    family_status: Optional[FamilyStatus] = None
    household_size: Optional[int] = None

    # Professional
    occupation: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[CompanySize] = None
    job_title: Optional[str] = None
    work_experience_years: Optional[int] = None

    # Additional Demographics
    language_preference: Optional[str] = None
    cultural_background: Optional[str] = None
    disability_status: Optional[str] = None

    # Timestamps
    created_at: datetime = None
    updated_at: Optional[datetime] = None

    # Additional Data
    metadata: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        """Initialize default values."""
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.metadata is None:
            self.metadata = {}

    def get_age_group(self) -> Optional[str]:
        """Get age group category."""
        if self.age is None:
            return None

        if self.age < 18:
            return "minor"
        elif self.age < 25:
            return "young_adult"
        elif self.age < 35:
            return "millennial"
        elif self.age < 50:
            return "gen_x"
        elif self.age < 65:
            return "boomer"
        else:
            return "senior"

    def get_income_range(self) -> Optional[tuple]:
        """Get income range as tuple (min, max)."""
        income_ranges = {
            IncomeBracket.LOW: (0, 30000),
            IncomeBracket.MEDIUM: (30000, 75000),
            IncomeBracket.HIGH: (75000, 150000),
            IncomeBracket.VERY_HIGH: (150000, float('inf')),
        }
        return income_ranges.get(self.income_bracket)

    def get_education_level_numeric(self) -> Optional[int]:
        """Get education level as numeric value (1-6)."""
        education_levels = {
            EducationLevel.HIGH_SCHOOL: 1,
            EducationLevel.ASSOCIATE: 2,
            EducationLevel.BACHELOR: 3,
            EducationLevel.MASTER: 4,
            EducationLevel.PHD: 5,
            EducationLevel.PROFESSIONAL: 6,
        }
        return education_levels.get(self.education_level)

    def get_company_size_numeric(self) -> Optional[int]:
        """Get company size as numeric value (1-5)."""
        company_sizes = {
            CompanySize.STARTUP: 1,
            CompanySize.SMALL: 2,
            CompanySize.MEDIUM: 3,
            CompanySize.LARGE: 4,
            CompanySize.ENTERPRISE: 5,
        }
        return company_sizes.get(self.company_size)

    def is_high_income(self) -> bool:
        """Check if customer has high income."""
        return self.income_bracket in [IncomeBracket.HIGH, IncomeBracket.VERY_HIGH]

    def is_highly_educated(self) -> bool:
        """Check if customer is highly educated."""
        return self.education_level in [
            EducationLevel.MASTER,
            EducationLevel.PHD,
            EducationLevel.PROFESSIONAL,
        ]

    def is_working_professional(self) -> bool:
        """Check if customer is a working professional."""
        return (
            self.occupation is not None
            and self.industry is not None
            and self.work_experience_years is not None
            and self.work_experience_years > 0
        )

    def get_demographic_segment(self) -> str:
        """Get demographic segment based on key characteristics."""
        if self.age is None:
            return "unknown"

        # Age-based segments
        if self.age < 25:
            if self.is_highly_educated():
                return "young_professional"
            else:
                return "young_adult"
        elif self.age < 35:
            if self.is_high_income() and self.is_working_professional():
                return "millennial_professional"
            else:
                return "millennial"
        elif self.age < 50:
            if self.family_status in [FamilyStatus.MARRIED, FamilyStatus.PARTNERED]:
                return "family_oriented"
            elif self.is_high_income():
                return "established_professional"
            else:
                return "gen_x"
        elif self.age < 65:
            if self.family_status in [FamilyStatus.MARRIED, FamilyStatus.PARTNERED]:
                return "mature_family"
            else:
                return "boomer"
        else:
            return "senior"

    def get_lifestyle_indicators(self) -> Dict[str, Any]:
        """Get lifestyle indicators based on demographics."""
        indicators = {
            "age_group": self.get_age_group(),
            "income_level": self.income_bracket.value if self.income_bracket else None,
            "education_level": (
                self.education_level.value if self.education_level else None
            ),
            "family_status": self.family_status.value if self.family_status else None,
            "professional_status": (
                "working" if self.is_working_professional() else "non_working"
            ),
            "company_size": self.company_size.value if self.company_size else None,
            "demographic_segment": self.get_demographic_segment(),
        }

        # Add derived indicators
        indicators["is_high_income"] = self.is_high_income()
        indicators["is_highly_educated"] = self.is_highly_educated()
        indicators["is_working_professional"] = self.is_working_professional()

        return indicators

    def get_marketing_segments(self) -> List[str]:
        """Get marketing segments based on demographics."""
        segments = []

        # Age-based segments
        age_group = self.get_age_group()
        if age_group:
            segments.append(f"age_{age_group}")

        # Income-based segments
        if self.income_bracket:
            segments.append(f"income_{self.income_bracket.value}")

        # Education-based segments
        if self.education_level:
            segments.append(f"education_{self.education_level.value}")

        # Family-based segments
        if self.family_status:
            segments.append(f"family_{self.family_status.value}")

        # Professional segments
        if self.is_working_professional():
            segments.append("working_professional")
            if self.industry:
                segments.append(f"industry_{self.industry.lower().replace(' ', '_')}")
            if self.company_size:
                segments.append(f"company_{self.company_size.value}")

        # Geographic segments
        if self.location_country:
            segments.append(f"country_{self.location_country.lower()}")
        if self.location_region:
            segments.append(f"region_{self.location_region.lower().replace(' ', '_')}")

        return segments

    def update_demographics(self, **kwargs):
        """Update demographics with new data."""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)

        self.updated_at = datetime.utcnow()

    def get_completeness_score(self) -> float:
        """Calculate demographics completeness score (0.0 to 1.0)."""
        required_fields = [
            'age',
            'gender',
            'location_country',
            'income_bracket',
            'education_level',
            'family_status',
            'occupation',
            'industry',
        ]

        completed_fields = sum(
            1 for field in required_fields if getattr(self, field) is not None
        )
        return completed_fields / len(required_fields)

    def get_demographic_summary(self) -> Dict[str, Any]:
        """Get a summary of demographic information."""
        return {
            "age": self.age,
            "age_group": self.get_age_group(),
            "gender": self.gender.value if self.gender else None,
            "location": {
                "country": self.location_country,
                "region": self.location_region,
                "city": self.location_city,
                "timezone": self.timezone,
            },
            "socioeconomic": {
                "income_bracket": (
                    self.income_bracket.value if self.income_bracket else None
                ),
                "income_range": self.get_income_range(),
                "education_level": (
                    self.education_level.value if self.education_level else None
                ),
                "family_status": (
                    self.family_status.value if self.family_status else None
                ),
                "household_size": self.household_size,
            },
            "professional": {
                "occupation": self.occupation,
                "industry": self.industry,
                "company_size": self.company_size.value if self.company_size else None,
                "job_title": self.job_title,
                "work_experience_years": self.work_experience_years,
            },
            "additional": {
                "language_preference": self.language_preference,
                "cultural_background": self.cultural_background,
                "disability_status": self.disability_status,
            },
            "indicators": self.get_lifestyle_indicators(),
            "marketing_segments": self.get_marketing_segments(),
            "completeness_score": self.get_completeness_score(),
            "demographic_segment": self.get_demographic_segment(),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "age": self.age,
            "gender": self.gender.value if self.gender else None,
            "location_country": self.location_country,
            "location_region": self.location_region,
            "location_city": self.location_city,
            "timezone": self.timezone,
            "income_bracket": (
                self.income_bracket.value if self.income_bracket else None
            ),
            "education_level": (
                self.education_level.value if self.education_level else None
            ),
            "family_status": self.family_status.value if self.family_status else None,
            "household_size": self.household_size,
            "occupation": self.occupation,
            "industry": self.industry,
            "company_size": self.company_size.value if self.company_size else None,
            "job_title": self.job_title,
            "work_experience_years": self.work_experience_years,
            "language_preference": self.language_preference,
            "cultural_background": self.cultural_background,
            "disability_status": self.disability_status,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
