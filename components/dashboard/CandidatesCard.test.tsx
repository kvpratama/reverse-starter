import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CandidatesCard from "./CandidatesCard";
import type { Candidate } from "@/app/types/types";

// Mock the UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid={props["data-testid"]}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div className={className} data-testid="card-footer">
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/progress-ring", () => ({
  __esModule: true,
  default: ({ score, title, size }: any) => (
    <div data-testid={`progress-ring-${title.toLowerCase().replace(" ", "-")}`}>
      {title}: {score}%
    </div>
  ),
}));

jest.mock("@/components/dashboard/JobseekerProfileCardUI", () => ({
  JobseekerProfileCardUI: ({
    profile,
    screeningQuestions,
    screeningAnswers,
  }: any) => (
    <div data-testid="jobseeker-profile-card">
      <div>Name: {profile.name}</div>
      <div>Email: {profile.email}</div>
      {screeningQuestions && (
        <div data-testid="screening-questions">
          {screeningQuestions.map((q: any, i: number) => (
            <div key={i}>Q: {q.question}</div>
          ))}
        </div>
      )}
      {screeningAnswers && (
        <div data-testid="screening-answers">
          {screeningAnswers.map((a: any, i: number) => (
            <div key={i}>A: {a.answer}</div>
          ))}
        </div>
      )}
    </div>
  ),
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockCandidate: Candidate = {
  id: "candidate-1",
  similarityScore: 85,
  similarityScoreBio: 75,
  similarityScoreSkills: 90,
  reasoning:
    "This candidate has excellent skills matching the job requirements with 5 years of relevant experience.",
  updatedAt: "2024-01-15T10:30:00Z",
  status: "applied",
  screeningAnswers: [
    { answer: "Yes, I have 5 years of experience with React" },
    { answer: "I am available to start immediately" },
  ],
  profile: {
    id: "profile-1",
    name: "John Doe",
    email: "john.doe@example.com",
    jobCategory: "Technology",
    jobSubcategory: "Frontend Development",
    jobRole: "React Developer",
    skills: "React, TypeScript, Node.js, AWS",
    age: 28,
    visaStatus: "US Citizen",
    nationality: "American",
    bio: "Experienced frontend developer with a passion for creating user-friendly applications.",
    workExperience: [
      {
        position: "Senior Frontend Developer",
        company: "Tech Corp",
        startDate: "2022-01",
        endDate: "2024-01",
        description: "Led frontend development team",
      },
    ],
    education: [
      {
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        institution: "State University",
        startDate: "2018",
        endDate: "2022",
      },
    ],
  },
};

const mockInvitedCandidate: Candidate = {
  ...mockCandidate,
  id: "candidate-2",
  status: "interview_invited",
  profile: {
    ...mockCandidate.profile!,
    id: "profile-2",
    name: "Jane Smith",
  },
};

const mockScreeningQuestions = [
  { question: "How many years of React experience do you have?" },
  { question: "When can you start?" },
];

describe("CandidatesCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders with no candidates", () => {
    render(<CandidatesCard candidates={[]} />);

    expect(screen.getByText("Potential Candidates (0)")).toBeInTheDocument();
    expect(screen.getByText("No candidates yet.")).toBeInTheDocument();
  });

  it("renders candidate cards correctly", () => {
    render(<CandidatesCard candidates={[mockCandidate]} />);

    expect(screen.getByText("Potential Candidates (1)")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Senior Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(
      screen.getByText("Bachelor of Science in Computer Science"),
    ).toBeInTheDocument();
    expect(screen.getByText("State University")).toBeInTheDocument();
  });

  it("displays progress rings with correct scores", () => {
    render(<CandidatesCard candidates={[mockCandidate]} />);

    expect(screen.getByTestId("progress-ring-overall-match")).toHaveTextContent(
      "Overall Match: 85%",
    );
    expect(screen.getByTestId("progress-ring-bio-match")).toHaveTextContent(
      "Bio Match: 75%",
    );
    expect(screen.getByTestId("progress-ring-skills-match")).toHaveTextContent(
      "Skills Match: 90%",
    );
  });

  it("displays AI reasoning with truncation for long text", () => {
    const longReasoning = "A".repeat(200);
    const candidateWithLongReasoning = {
      ...mockCandidate,
      reasoning: longReasoning,
    };

    render(<CandidatesCard candidates={[candidateWithLongReasoning]} />);

    const aiOverview = screen.getByText(/A{150}\.\.\.$/);
    expect(aiOverview).toBeInTheDocument();
  });

  it("shows invited status for candidates with interview status", () => {
    render(<CandidatesCard candidates={[mockInvitedCandidate]} />);

    expect(screen.getByText("Invited")).toBeInTheDocument();
    expect(screen.getByText(/Invited for interview/)).toBeInTheDocument();
  });

  it('opens profile modal when "View Profile" is clicked', async () => {
    render(
      <CandidatesCard
        candidates={[mockCandidate]}
        screeningQuestions={mockScreeningQuestions}
      />,
    );

    const viewProfileButton = screen.getByText("View Profile");
    fireEvent.click(viewProfileButton);

    expect(screen.getByText("Candidate Profile")).toBeInTheDocument();
    expect(screen.getByTestId("jobseeker-profile-card")).toBeInTheDocument();
    expect(screen.getByText("Name: John Doe")).toBeInTheDocument();
    expect(screen.getByText("Email: john.doe@example.com")).toBeInTheDocument();
  });

  it("displays screening questions and answers in profile modal", async () => {
    render(
      <CandidatesCard
        candidates={[mockCandidate]}
        screeningQuestions={mockScreeningQuestions}
      />,
    );

    fireEvent.click(screen.getByText("View Profile"));

    expect(screen.getByTestId("screening-questions")).toBeInTheDocument();
    expect(
      screen.getByText("Q: How many years of React experience do you have?"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("screening-answers")).toBeInTheDocument();
    expect(
      screen.getByText("A: Yes, I have 5 years of experience with React"),
    ).toBeInTheDocument();
  });

  it("closes profile modal when close button is clicked", async () => {
    render(<CandidatesCard candidates={[mockCandidate]} />);

    fireEvent.click(screen.getByText("View Profile"));
    expect(screen.getByText("Candidate Profile")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByText("Candidate Profile")).not.toBeInTheDocument();
  });

  it('opens invite modal when "Invite For Interview" is clicked', async () => {
    render(<CandidatesCard candidates={[mockCandidate]} jobPostId="job-123" />);

    fireEvent.click(screen.getByText("Invite For Interview"));

    expect(screen.getByText("Invite for Interview")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("https://calendly.com/your-link"),
    ).toBeInTheDocument();
  });

  it("validates URL input in invite modal", async () => {
    render(<CandidatesCard candidates={[mockCandidate]} jobPostId="job-123" />);

    fireEvent.click(screen.getByText("Invite For Interview"));

    const urlInput = screen.getByPlaceholderText(
      "https://calendly.com/your-link",
    );
    const sendButton = screen.getByText("Send Invitation");

    // Button should be disabled initially
    expect(sendButton).toBeDisabled();

    // Invalid URL should keep button disabled
    fireEvent.change(urlInput, { target: { value: "invalid-url" } });
    expect(sendButton).toBeDisabled();

    // Valid URL should enable button
    fireEvent.change(urlInput, {
      target: { value: "https://calendly.com/test-link" },
    });
    expect(sendButton).not.toBeDisabled();
  });

  it("sends invitation successfully", async () => {
    const mockFetch = jest.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(<CandidatesCard candidates={[mockCandidate]} jobPostId="job-123" />);

    fireEvent.click(screen.getByText("Invite For Interview"));

    const urlInput = screen.getByPlaceholderText(
      "https://calendly.com/your-link",
    );
    fireEvent.change(urlInput, {
      target: { value: "https://calendly.com/test-link" },
    });

    fireEvent.click(screen.getByText("Send Invitation"));

    expect(mockFetch).toHaveBeenCalledWith("/api/interviews/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobPostId: "job-123",
        profileId: "profile-1",
        calendlyLink: "https://calendly.com/test-link",
      }),
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Invite for Interview"),
      ).not.toBeInTheDocument();
    });
  });

  it("handles invitation API error", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockFetch = jest.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to send invitation" }),
    } as Response);

    render(<CandidatesCard candidates={[mockCandidate]} jobPostId="job-123" />);

    fireEvent.click(screen.getByText("Invite For Interview"));

    const urlInput = screen.getByPlaceholderText(
      "https://calendly.com/your-link",
    );
    fireEvent.change(urlInput, {
      target: { value: "https://calendly.com/test-link" },
    });

    fireEvent.click(screen.getByText("Send Invitation"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("updates button state after successful invitation", async () => {
    const mockFetch = jest.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(<CandidatesCard candidates={[mockCandidate]} jobPostId="job-123" />);

    // Initially should show "Invite For Interview"
    expect(screen.getByText("Invite For Interview")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Invite For Interview"));
    const urlInput = screen.getByPlaceholderText(
      "https://calendly.com/your-link",
    );
    fireEvent.change(urlInput, {
      target: { value: "https://calendly.com/test-link" },
    });
    fireEvent.click(screen.getByText("Send Invitation"));

    // After successful invitation, button should show "Invited"
    await waitFor(() => {
      expect(screen.getByText("Invited")).toBeInTheDocument();
      expect(
        screen.queryByText("Invite For Interview"),
      ).not.toBeInTheDocument();
    });
  });

  it("closes invite modal when cancel is clicked", async () => {
    render(<CandidatesCard candidates={[mockCandidate]} jobPostId="job-123" />);

    fireEvent.click(screen.getByText("Invite For Interview"));
    expect(screen.getByText("Invite for Interview")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Invite for Interview")).not.toBeInTheDocument();
  });

  it("handles candidates without profiles gracefully", () => {
    const candidateWithoutProfile: Candidate = {
      id: "candidate-no-profile",
      similarityScore: 70,
      reasoning: "Basic candidate info",
      updatedAt: "2024-01-15T10:30:00Z",
      status: "applied",
      profile: null,
    };

    render(<CandidatesCard candidates={[candidateWithoutProfile]} />);

    expect(screen.getByText("Potential Candidates (1)")).toBeInTheDocument();
    // Component should render without crashing even with null profile
  });

  it("formats date ranges correctly", () => {
    render(<CandidatesCard candidates={[mockCandidate]} />);

    expect(screen.getByText("2022-01 - 2024-01")).toBeInTheDocument();
    expect(screen.getByText("2018 - 2022")).toBeInTheDocument();
  });

  it("handles missing work experience and education", () => {
    const candidateWithoutExperience: Candidate = {
      ...mockCandidate,
      profile: {
        ...mockCandidate.profile!,
        workExperience: [],
        education: [],
      },
    };

    render(<CandidatesCard candidates={[candidateWithoutExperience]} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    // Should not show work experience or education sections
    expect(screen.queryByText("Latest Experience")).not.toBeInTheDocument();
    expect(screen.queryByText("Education")).not.toBeInTheDocument();
  });

  it("displays AI reasoning in profile modal", async () => {
    render(<CandidatesCard candidates={[mockCandidate]} />);

    fireEvent.click(screen.getByText("View Profile"));

    // Look for the specific AI overview text that includes the disclaimer (only in modal)
    expect(
      screen.getByText(
        "AI can make mistakes — please verify any critical information for accuracy",
      ),
    ).toBeInTheDocument();
    // Verify the modal opened by checking for the profile modal title
    expect(screen.getByText("Candidate Profile")).toBeInTheDocument();
  });
});
