import { render, screen, fireEvent } from "@testing-library/react";
import CreateProfileForm, { AnalysisDefaults } from "./CreateProfileForm";
import "@testing-library/jest-dom";

// Mock child components
jest.mock("@/components/dashboard/JobCategorySelector", () => () => <div data-testid="job-category-selector"></div>);
jest.mock("@/components/dashboard/SkillsInput", () => () => <div data-testid="skills-input"></div>);
jest.mock("@/components/dashboard/WorkExperienceSection", () => () => <div data-testid="work-experience-section"></div>);
jest.mock("@/components/dashboard/EducationSection", () => () => <div data-testid="education-section"></div>);
jest.mock("@/components/dashboard/VisaCategorySelect", () => () => <div data-testid="visa-category-select"></div>);
jest.mock("@/components/dashboard/NationalitySelect", () => () => <div data-testid="nationality-select"></div>);

describe("CreateProfileForm", () => {
  const mockAction = jest.fn();
  const mockDefaults: AnalysisDefaults = {
    name: "John Doe",
    email: "john.doe@example.com",
    age: 30,
    visaStatus: "H1B",
    nationality: "American",
    bio: "A software engineer.",
    skills: "React, TypeScript",
    fileurl: "http://example.com/resume.pdf",
    work_experience: [
      {
        start_date: "2020-01-01",
        end_date: "2022-01-01",
        position: "Software Engineer",
        company: "Tech Corp",
        description: "Worked on stuff.",
      },
    ],
    education: [
      {
        start_date: "2016-01-01",
        end_date: "2020-01-01",
        degree: "BSc Computer Science",
        field_of_study: "Computer Science",
        institution: "University of Tech",
        description: "Studied stuff.",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form with default values", () => {
    render(
      <CreateProfileForm
        action={mockAction}
        isCreating={false}
        defaults={mockDefaults}
      />
    );

    expect(screen.getByPlaceholderText("Name this profile e.g. Senior Sales Manager Profile")).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toHaveValue("John Doe");
    expect(screen.getByLabelText("Age")).toBeInTheDocument();
    expect(screen.getByText("A software engineer.")).toBeInTheDocument();
    expect(screen.getByText("Resume.pdf")).toBeInTheDocument();
  });

  it("calls the action with form data on submit", () => {
    render(
      <CreateProfileForm
        action={mockAction}
        isCreating={false}
        defaults={mockDefaults}
      />
    );

    const form = screen.getByRole("button", { name: "Create Profile" }).closest("form");
    fireEvent.submit(form!);

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it("disables the submit button when isCreating is true", () => {
    render(
      <CreateProfileForm
        action={mockAction}
        isCreating={true}
        defaults={mockDefaults}
      />
    );

    expect(screen.getByRole("button", { name: "Creating Your Profile..." })).toBeDisabled();
  });

  it("displays an error message when error prop is provided", () => {
    const errorMessage = "An error occurred.";
    render(
      <CreateProfileForm
        action={mockAction}
        isCreating={false}
        defaults={mockDefaults}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
