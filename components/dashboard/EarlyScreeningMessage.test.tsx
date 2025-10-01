import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { jest } from "@jest/globals";
import EarlyScreeningMessage from "./EarlyScreeningMessage";
import type { Message, JobPost } from "@/app/types/types";

const renderAsync = async (ui: React.ReactElement) => {
  let utils: any;
  await act(async () => {
    utils = render(ui);
  });
  return utils;
};

// Mock the UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, style, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      data-testid={`button-${children?.toString().toLowerCase().replace(/\s+/g, "-")}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className} data-testid="card-header">
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div className={className} data-testid="card-title">
      {children}
    </div>
  ),
}));

// Mock child components to prevent them from making API calls
jest.mock("./JobseekerProfileCard", () => ({
  JobseekerProfileCard: ({ profileId }: { profileId: string }) => {
    // Mock component that doesn't make API calls
    return (
      <div data-testid="jobseeker-profile-card">
        <h2>Profile for {profileId}</h2>
        <p>Name: Test User</p>
        <p>Email: test@example.com</p>
      </div>
    );
  },
}));

jest.mock("./ParticipateModal", () => ({
  ParticipateModal: ({ open, onClose, onSuccess, jobPost, profileId }: any) =>
    open ? (
      <div data-testid="participate-modal">
        <button
          onClick={() => {
            onSuccess();
            onClose();
          }}
          data-testid="participate-submit"
        >
          Submit Participation
        </button>
        <button onClick={onClose} data-testid="participate-close">
          Close
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/dashboard/JobPostDetailsCard", () => ({
  __esModule: true,
  default: ({ jobPost }: { jobPost: JobPost }) => (
    <div data-testid="job-post-details-card">
      Job: {jobPost.title} - {jobPost.company}
    </div>
  ),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("EarlyScreeningMessage", () => {
  const mockMessage: Message = {
    id: "1",
    content:
      "This is a test early screening message with <strong>HTML content</strong>",
    jobPostId: "job-123",
    timestamp: new Date(),
    type: "early_screening",
    sender: "system",
  };

  const mockJobPost: JobPost = {
    id: "job-123",
    title: "Software Engineer",
    company: "Tech Corp",
    description: "Great job opportunity",
    requirements: ["JavaScript", "React"],
    location: "Remote",
    salary: "$100,000",
    type: "full-time",
    postedDate: new Date(),
    applicationDeadline: new Date(),
    questions: [
      { id: 1, question: "What is your experience with React?", type: "text" },
      {
        id: 2,
        question: "Are you available to start immediately?",
        type: "boolean",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();

    // Set up default fetch responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/api/job-posts/")) {
        if (url.includes("/participation")) {
          // Mock participation check response
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ hasParticipated: false }),
          });
        } else {
          // Mock job post fetch response
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ job: mockJobPost }),
          });
        }
      }

      // Default response for unhandled URLs
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      });
    });
  });

  describe("Component Rendering", () => {
    it("renders message content with HTML", async () => {
      await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

      const messageContent = screen.getByText(
        (content, element) =>
          element?.innerHTML ===
          "This is a test early screening message with <strong>HTML content</strong>",
      );
      expect(messageContent).toBeInTheDocument();
    });

    it("renders all action buttons", async () => {
      await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
      );

      // Wait for async effects to complete
      await waitFor(() => {
        expect(screen.getByTestId("button-check-job-post")).toBeInTheDocument();
        expect(screen.getByTestId("button-participate")).toBeInTheDocument();
        expect(
          screen.getByTestId("button-view-your-profile"),
        ).toBeInTheDocument();
      });
    });

    it("disables profile button when no profileId provided", async () => {
      await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

      await waitFor(() => {
        const profileButton = screen.getByTestId("button-view-your-profile");
        expect(profileButton).toBeDisabled();
      });
    });

    it("fetches job post data on mount", async () => {
      await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/job-posts/job-123", {
          cache: "no-store",
        });
      });
    });

    it("checks participation status when profileId is provided", async () => {
      await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/job-posts/job-123/participation?profileId=profile-123",
          { cache: "no-store" },
        );
      });
    });

    it("handles fetch errors gracefully", async () => {
      // Mock fetch to throw an error
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Job Post Fetching", () => {
    it("fetches job post data on mount", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ job: mockJobPost }),
      });

      await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/job-posts/job-123", {
          cache: "no-store",
        });
      });
    });

    it("handles job post fetch error gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error("Fetch failed"));

      await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it("handles non-ok response for job post fetch", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it("does not fetch job post when jobPostId is missing", () => {
      const messageWithoutJobId = { ...mockMessage, jobPostId: undefined };
      render(<EarlyScreeningMessage msg={messageWithoutJobId} />);

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("Participation Status Checking", () => {
    it("checks participation status when both jobPostId and profileId are provided", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ job: mockJobPost }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ hasParticipated: false }),
        });

      await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/job-posts/job-123/participation?profileId=profile-123",
          { cache: "no-store" },
        );
      });
    });

    it("hides participate button when user has already participated", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ job: mockJobPost }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ hasParticipated: true }),
        });

      await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
      );

      await waitFor(() => {
        const participateButton = screen.getByTestId("button-participate");
        expect(participateButton.style.display).toBe("none");
      });
    });

    it("shows participate button when user has not participated", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ job: mockJobPost }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ hasParticipated: false }),
        });

      await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
      );

      await waitFor(() => {
        const participateButton = screen.getByTestId("button-participate");
        expect(participateButton.style.display).toBe("block");
      });
    });

    it("does not check participation when profileId is missing", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ job: mockJobPost }),
      });

      await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

      expect(mockFetch).toHaveBeenCalledTimes(1); // Only job post fetch
    });

    it("handles participation check error gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ job: mockJobPost }),
        })
        .mockRejectedValueOnce(new Error("Participation check failed"));

      await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Modal Interactions", () => {
    beforeEach(async () => {
      // Set up comprehensive fetch mocking for all modal tests
      mockFetch.mockImplementation((url: string) => {
        if (url.includes("/api/job-posts/")) {
          if (url.includes("/participation")) {
            return Promise.resolve({
              ok: true,
              json: async () => ({ hasParticipated: false }),
            });
          } else {
            return Promise.resolve({
              ok: true,
              json: async () => ({ job: mockJobPost }),
            });
          }
        }
        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        });
      });
    });

    describe("Job Post Modal", () => {
      it("opens job post modal when Check Job Post button is clicked", async () => {
        await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

        // Wait for initial async operations to complete
        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalled();
        });

        await act(async () => {
          fireEvent.click(screen.getByTestId("button-check-job-post"));
        });

        await waitFor(() => {
          expect(
            screen.getByTestId("job-post-details-card"),
          ).toBeInTheDocument();
        });
      });

      it("closes job post modal when backdrop is clicked", async () => {
        await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalled();
        });

        await act(async () => {
          fireEvent.click(screen.getByTestId("button-check-job-post"));
        });

        await waitFor(() => {
          expect(
            screen.getByTestId("job-post-details-card"),
          ).toBeInTheDocument();
        });

        await act(async () => {
          fireEvent.click(screen.getByTestId("modal-backdrop"));
        });

        await waitFor(() => {
          expect(
            screen.queryByTestId("job-post-details-card"),
          ).not.toBeInTheDocument();
        });
      });
    });

    describe("Participate Modal", () => {
      it("opens participate modal when Participate button is clicked", async () => {
        await renderAsync(
          <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
        );

        // Wait for async operations to complete
        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledTimes(2); // job fetch + participation check
        });

        await act(async () => {
          fireEvent.click(screen.getByTestId("button-participate"));
        });

        expect(screen.getByTestId("participate-modal")).toBeInTheDocument();
      });
    });

    describe("Profile Modal", () => {
      it("disables profile button when no profileId is available", async () => {
        await renderAsync(
          <EarlyScreeningMessage msg={mockMessage} profileId={undefined} />,
        );

        // Wait for async job fetch to complete
        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledTimes(1); // only job fetch, no participation check
        });

        const profileButton = screen.getByTestId("button-view-your-profile");
        expect(profileButton).toBeDisabled();
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    beforeEach(() => {
      // Set up default fetch responses for edge cases
      mockFetch.mockImplementation((url: string) => {
        if (url.includes("/api/job-posts/")) {
          if (url.includes("/participation")) {
            return Promise.resolve({
              ok: true,
              json: async () => ({ hasParticipated: false }),
            });
          } else {
            return Promise.resolve({
              ok: true,
              json: async () => ({ job: mockJobPost }),
            });
          }
        }
        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        });
      });
    });

    it("handles missing message content", async () => {
      const messageWithoutContent = { ...mockMessage, content: "" };
      await renderAsync(<EarlyScreeningMessage msg={messageWithoutContent} />);

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Should still render buttons even with empty content
      expect(screen.getByTestId("button-check-job-post")).toBeInTheDocument();
    });

    it("handles null job post data", async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes("/participation")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ hasParticipated: false }),
          });
        } else {
          return Promise.resolve({
            ok: true,
            json: async () => ({ job: null }),
          });
        }
      });

      await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

      // Wait for fetch to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("button-check-job-post"));
      });

      // Modal should open but not show job details
      await waitFor(() => {
        expect(screen.getByTestId("card")).toBeInTheDocument();
        expect(
          screen.queryByTestId("job-post-details-card"),
        ).not.toBeInTheDocument();
      });
    });

    it("handles component unmounting during async operations", async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ job: mockJobPost }),
                }),
              100,
            ),
          ),
      );

      const { unmount } = await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} />,
      );

      // Unmount before fetch completes
      act(() => {
        unmount();
      });

      // Should not throw any errors
      // Wait a bit to ensure no state updates after unmount
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    it("handles fetch errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await renderAsync(<EarlyScreeningMessage msg={mockMessage} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes("/participation")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ hasParticipated: false }),
          });
        } else {
          return Promise.resolve({
            ok: true,
            json: async () => ({ job: mockJobPost }),
          });
        }
      });
    });

    it("has proper button labeling", async () => {
      await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      expect(screen.getByTestId("button-check-job-post")).toHaveTextContent(
        "Check Job Post",
      );
      expect(screen.getByTestId("button-participate")).toHaveTextContent(
        "Participate",
      );
      expect(screen.getByTestId("button-view-your-profile")).toHaveTextContent(
        "View Your Profile",
      );
    });

    it("properly handles modal focus management", async () => {
      await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("button-check-job-post"));
      });

      // Modal should be visible and focusable
      const modal = screen.getByTestId("card");
      expect(modal).toBeInTheDocument();
    });
  });

  describe("Performance Considerations", () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes("/participation")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ hasParticipated: false }),
          });
        } else {
          return Promise.resolve({
            ok: true,
            json: async () => ({ job: mockJobPost }),
          });
        }
      });
    });

    it("does not make unnecessary API calls on re-renders", async () => {
      const { rerender } = await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Re-render with same props
      await act(async () => {
        rerender(<EarlyScreeningMessage msg={mockMessage} />);
      });

      // Should not make additional API calls
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("handles rapid button clicks gracefully", async () => {
      await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      const button = screen.getByTestId("button-check-job-post");

      // Rapid clicks wrapped in act
      await act(async () => {
        fireEvent.click(button);
        fireEvent.click(button);
        fireEvent.click(button);
      });

      // Should only have one modal open
      expect(screen.getAllByTestId("card")).toHaveLength(1);
    });
  });

  describe("Participation State Management", () => {
    it("hides participate button when user has already participated", async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes("/participation")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ hasParticipated: true }),
          });
        } else {
          return Promise.resolve({
            ok: true,
            json: async () => ({ job: mockJobPost }),
          });
        }
      });

      await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      // Participate button should be hidden
      const participateButton = screen.getByTestId("button-participate");
      expect(participateButton).toHaveStyle({ display: "none" });
    });

    it("shows participate button when user has not participated", async () => {
      await renderAsync(
        <EarlyScreeningMessage msg={mockMessage} profileId="profile-123" />,
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      // Participate button should be visible
      const participateButton = screen.getByTestId("button-participate");
      expect(participateButton).toHaveStyle({ display: "block" });
    });
  });
});
