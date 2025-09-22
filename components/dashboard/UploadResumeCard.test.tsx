// UploadResumeCard.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UploadResumeCard from "./UploadResumeCard";
import "@testing-library/jest-dom";

describe("UploadResumeCard", () => {
  const mockAction = jest.fn();

  beforeEach(() => {
    mockAction.mockClear();
  });

  it("renders the component", () => {
    render(<UploadResumeCard action={mockAction} isUploading={false} />);
    expect(screen.getByText("Upload Your Resume")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Drag and drop your PDF here, or click to select a file.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("PDF up to 10MB")).toBeInTheDocument();
    expect(screen.getByText("Upload and Continue")).toBeInTheDocument();
  });

  it("shows an error for a file that is too large", () => {
    render(<UploadResumeCard action={mockAction} isUploading={false} />);
    const file = new File([""], "resume.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 11 * 1024 * 1024 }); // 11MB

    const input = screen.getByLabelText(
      "Drag and drop your PDF here, or click to select a file.",
    );
    fireEvent.change(input, { target: { files: [file] } });

    expect(
      screen.getByText("File too large. Please upload a PDF under 10MB."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload and Continue" }),
    ).toBeDisabled();
  });

  it("shows an error for an invalid file type", () => {
    render(<UploadResumeCard action={mockAction} isUploading={false} />);
    const file = new File([""], "resume.txt", { type: "text/plain" });

    const input = screen.getByLabelText(
      "Drag and drop your PDF here, or click to select a file.",
    );
    fireEvent.change(input, { target: { files: [file] } });

    expect(
      screen.getByText("Invalid file type. Please upload a PDF."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload and Continue" }),
    ).toBeDisabled();
  });

  it("displays the file name when a valid file is selected", () => {
    render(<UploadResumeCard action={mockAction} isUploading={false} />);
    const file = new File([""], "resume.pdf", { type: "application/pdf" });

    const input = screen.getByLabelText(
      "Drag and drop your PDF here, or click to select a file.",
    );
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText("Selected file:")).toBeInTheDocument();
    expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload and Continue" }),
    ).not.toBeDisabled();
  });

  it("handles drag and drop", async () => {
    render(<UploadResumeCard action={mockAction} isUploading={false} />);
    const file = new File([""], "resume.pdf", { type: "application/pdf" });

    // Find the dropzone by finding the parent of the text
    const dropzoneText = screen.getByText(
      "Drag and drop your PDF here, or click to select a file.",
    );
    const dropzone = dropzoneText.parentElement as HTMLElement;

    fireEvent.dragEnter(dropzone);
    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Selected file:")).toBeInTheDocument();
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
  });

  it("shows an error if submitting without a file", async () => {
    render(<UploadResumeCard action={mockAction} isUploading={false} />);

    // Find the form element directly
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();

    // Simulate form submission event
    fireEvent.submit(form!);

    // Wait for the error to appear since it's set in state
    await waitFor(() => {
      expect(
        screen.getByText("Please select a file to upload."),
      ).toBeInTheDocument();
    });
    expect(mockAction).not.toHaveBeenCalled();
  });

  it("disables the button when uploading", () => {
    render(<UploadResumeCard action={mockAction} isUploading={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(
      screen.getByText(/Our system is analyzing your resume/),
    ).toBeInTheDocument();
  });

  it("displays an error from the server", () => {
    render(
      <UploadResumeCard
        action={mockAction}
        isUploading={false}
        error="Server-side error"
      />,
    );
    expect(screen.getByText("Server-side error")).toBeInTheDocument();
  });
});
