import { render, screen, within } from "@testing-library/react";
import React from "react";
import WorkExperienceSection, { WorkExperience } from "./WorkExperienceSection";

// --- MOCK DATA ---
const mockExperiences: WorkExperience[] = [
  {
    position: "Senior Frontend Developer",
    company: "Innovate Inc.",
    start_date: "January 2022",
    end_date: "Present",
    description:
      "Led the development of the main user-facing application using React and TypeScript.",
  },
  {
    position: "Software Engineer",
    company: "Tech Solutions",
    start_date: "June 2020",
    end_date: "December 2021",
    description:
      "Developed and maintained features for a large-scale e-commerce platform.",
  },
  {
    position: "Junior Developer",
    company: "", // Edge case: empty company
    start_date: "May 2019",
    end_date: "May 2020",
    description: "Initial role after graduation.",
  },
];

// --- TEST SUITE ---
describe("WorkExperienceSection", () => {
  // --- 1. Rendering Logic ---
  describe("Rendering", () => {
    it("should render null if 'experiences' prop is an empty array", () => {
      const { container } = render(<WorkExperienceSection experiences={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it("should render null if 'experiences' prop is not a valid array", () => {
      // @ts-expect-error Testing invalid prop type
      const { container } = render(
        <WorkExperienceSection experiences={null} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("should render the correct number of experience cards", () => {
      render(<WorkExperienceSection experiences={mockExperiences} />);
      // Cards don't have an implicit role, so we'll find them by a known child element, like the title.
      const titles = screen.getAllByText(/Developer|Engineer/);
      expect(titles).toHaveLength(mockExperiences.length);
    });

    it("should display the correct data within each card", () => {
      render(<WorkExperienceSection experiences={mockExperiences} />);

      const firstExperience = mockExperiences[0];

      // Use `getByLabelText` for form fields as it's the most accessible way
      expect(screen.getAllByLabelText("Position")[0]).toHaveValue(
        firstExperience.position,
      );
      expect(screen.getAllByLabelText("Company")[0]).toHaveValue(
        firstExperience.company,
      );
      expect(screen.getAllByLabelText("Start Date")[0]).toHaveValue(
        firstExperience.start_date,
      );
      expect(screen.getAllByLabelText("End Date")[0]).toHaveValue(
        firstExperience.end_date,
      );
      expect(
        screen.getAllByLabelText("Job Description & Key Achievements")[0],
      ).toHaveValue(firstExperience.description);
    });

    it("should render the numbered badge correctly for each item", () => {
      render(<WorkExperienceSection experiences={mockExperiences} />);
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  // --- 2. Prop Functionality ---
  describe("Props Functionality", () => {
    describe("disabled prop", () => {
      it("should render all form fields as enabled by default", () => {
        render(<WorkExperienceSection experiences={[mockExperiences[0]]} />);
        expect(screen.getByLabelText("Position")).not.toBeDisabled();
        expect(screen.getByLabelText("Company")).not.toBeDisabled();
        expect(screen.getByLabelText("Start Date")).not.toBeDisabled();
        expect(screen.getByLabelText("End Date")).not.toBeDisabled();
        expect(
          screen.getByLabelText("Job Description & Key Achievements"),
        ).not.toBeDisabled();
      });

      it("should render all form fields as disabled when 'disabled' prop is true", () => {
        render(
          <WorkExperienceSection
            experiences={[mockExperiences[0]]}
            disabled={true}
          />,
        );
        expect(screen.getByLabelText("Position")).toBeDisabled();
        expect(screen.getByLabelText("Company")).toBeDisabled();
        expect(screen.getByLabelText("Start Date")).toBeDisabled();
        expect(screen.getByLabelText("End Date")).toBeDisabled();
        expect(
          screen.getByLabelText("Job Description & Key Achievements"),
        ).toBeDisabled();
      });
    });

    describe("namePrefix prop", () => {
      it("should use the default 'work_experience' prefix for field names and ids", () => {
        render(<WorkExperienceSection experiences={[mockExperiences[0]]} />);
        const positionInput = screen.getByLabelText("Position");
        expect(positionInput).toHaveAttribute(
          "name",
          "work_experience[0][position]",
        );
        expect(positionInput).toHaveAttribute(
          "id",
          "work_experience[0][position]",
        );
      });

      it("should use the custom prefix when 'namePrefix' prop is provided", () => {
        render(
          <WorkExperienceSection
            experiences={[mockExperiences[0]]}
            namePrefix="custom_prefix"
          />,
        );
        const positionInput = screen.getByLabelText("Position");
        expect(positionInput).toHaveAttribute(
          "name",
          "custom_prefix[0][position]",
        );
        expect(positionInput).toHaveAttribute(
          "id",
          "custom_prefix[0][position]",
        );
      });
    });
  });

  // --- 3. UI and Edge Cases ---
  describe("UI and Edge Cases", () => {
    it("should render placeholder text correctly", () => {
      render(
        <WorkExperienceSection
          experiences={[
            {
              position: "",
              company: "",
              start_date: "",
              end_date: "",
              description: "",
            },
          ]}
        />,
      );
      expect(
        screen.getByPlaceholderText("e.g. Senior Software Engineer"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("e.g. Tech Solutions Inc."),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("e.g. January 2020"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("e.g. Present or December 2023"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Describe your key responsibilities/),
      ).toBeInTheDocument();
    });

    it("should gracefully handle a missing company name in the card header", () => {
      render(<WorkExperienceSection experiences={mockExperiences} />);

      // Find the card for the "Junior Developer" position (index 2)
      const juniorCard = screen.getByTestId("work-experience-card-2");

      // Check that "at [company]" is not present within this specific card
      // Use a more specific regex that looks for "at " followed by text
      expect(
        within(juniorCard).queryByText(/\bat\s+\w/),
      ).not.toBeInTheDocument();

      // Find the senior developer card (index 0)
      const seniorCard = screen.getByTestId("work-experience-card-0");

      // Check that "at Innovate Inc." IS present for a complete entry
      expect(
        within(seniorCard).getByText(/at Innovate Inc\./),
      ).toBeInTheDocument();
    });

    it("should render the helper text under the description textarea", () => {
      render(<WorkExperienceSection experiences={[mockExperiences[0]]} />);
      const helperText = screen.getByText(
        /Include specific achievements, technologies used/,
      );
      expect(helperText).toBeInTheDocument();
    });
  });
});
