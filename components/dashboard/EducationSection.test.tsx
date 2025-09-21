import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EducationSection, { Education } from './EducationSection';

// Mock the UI components
jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, name, defaultValue, disabled, className, placeholder, ...props }: any) => (
    <input
      id={id}
      name={name}
      defaultValue={defaultValue}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ id, name, defaultValue, rows, disabled, className, placeholder, ...props }: any) => (
    <textarea
      id={id}
      name={name}
      defaultValue={defaultValue}
      rows={rows}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  GraduationCap: ({ className }: any) => <div className={`icon graduation-cap ${className}`} />,
  Calendar: ({ className }: any) => <div className={`icon calendar ${className}`} />,
  BookOpen: ({ className }: any) => <div className={`icon book-open ${className}`} />,
  School: ({ className }: any) => <div className={`icon school ${className}`} />,
  FileText: ({ className }: any) => <div className={`icon file-text ${className}`} />,
}));

const mockEducation: Education = {
  start_date: "September 2018",
  end_date: "May 2022",
  degree: "Bachelor of Science",
  field_of_study: "Computer Science",
  institution: "Stanford University",
  description: "Graduated magna cum laude with a focus on artificial intelligence and machine learning. Completed senior thesis on neural networks."
};

const mockEducationArray: Education[] = [
  mockEducation,
  {
    start_date: "August 2022",
    end_date: "Present",
    degree: "Master of Science",
    field_of_study: "Data Science",
    institution: "MIT",
    description: "Currently pursuing advanced studies in statistical modeling and big data analytics."
  }
];

describe('EducationSection', () => {
  describe('Rendering', () => {
    it('renders nothing when educations array is empty', () => {
      const { container } = render(<EducationSection educations={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when educations is not an array', () => {
      const { container } = render(<EducationSection educations={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders education cards when educations array has items', () => {
      render(<EducationSection educations={mockEducationArray} />);
      
      // Should render both education entries
      expect(screen.getByDisplayValue("Bachelor of Science")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Master of Science")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Stanford University")).toBeInTheDocument();
      expect(screen.getByDisplayValue("MIT")).toBeInTheDocument();
    });

    it('displays correct numbering for multiple education entries', () => {
      render(<EducationSection educations={mockEducationArray} />);
      
      // Should show numbered badges
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it('displays degree and field of study in the title correctly', () => {
      render(<EducationSection educations={[mockEducation]} />);
      
      expect(screen.getByText("Bachelor of Science")).toBeInTheDocument();
      expect(screen.getByText("in Computer Science")).toBeInTheDocument();
    });

    it('displays institution in the subtitle', () => {
      render(<EducationSection educations={[mockEducation]} />);
      
      expect(screen.getByText("Stanford University")).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('renders all form fields with correct names and IDs', () => {
      render(<EducationSection educations={[mockEducation]} />);
      
      // Check all form fields are present
      expect(screen.getByRole('textbox', { name: /degree/i })).toHaveAttribute('name', 'education[0][degree]');
      expect(screen.getByRole('textbox', { name: /field of study/i })).toHaveAttribute('name', 'education[0][field_of_study]');
      expect(screen.getByRole('textbox', { name: /institution/i })).toHaveAttribute('name', 'education[0][institution]');
      expect(screen.getByRole('textbox', { name: /start date/i })).toHaveAttribute('name', 'education[0][start_date]');
      expect(screen.getByRole('textbox', { name: /end date/i })).toHaveAttribute('name', 'education[0][end_date]');
      expect(screen.getByRole('textbox', { name: /description/i })).toHaveAttribute('name', 'education[0][description]');
    });

    it('uses custom namePrefix when provided', () => {
      render(<EducationSection educations={[mockEducation]} namePrefix="custom_education" />);
      
      expect(screen.getByRole('textbox', { name: /degree/i })).toHaveAttribute('name', 'custom_education[0][degree]');
      expect(screen.getByRole('textbox', { name: /field of study/i })).toHaveAttribute('name', 'custom_education[0][field_of_study]');
    });

    it('populates fields with education data', () => {
      render(<EducationSection educations={[mockEducation]} />);
      
      expect(screen.getByDisplayValue("Bachelor of Science")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Computer Science")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Stanford University")).toBeInTheDocument();
      expect(screen.getByDisplayValue("September 2018")).toBeInTheDocument();
      expect(screen.getByDisplayValue("May 2022")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Graduated magna cum laude with a focus on artificial intelligence and machine learning. Completed senior thesis on neural networks.")).toBeInTheDocument();
    });

    it('shows correct placeholders for empty fields', () => {
      const emptyEducation: Education = {
        start_date: "",
        end_date: "",
        degree: "",
        field_of_study: "",
        institution: "",
        description: ""
      };
      
      render(<EducationSection educations={[emptyEducation]} />);
      
      expect(screen.getByPlaceholderText("e.g. Bachelor of Science, Master of Arts")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. Computer Science, Business Administration")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. Stanford University, MIT")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. September 2018")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. May 2022 or Present")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Describe relevant coursework, academic achievements, honors, GPA, thesis work, or extracurricular activities...")).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables all form fields when disabled prop is true', () => {
      render(<EducationSection educations={[mockEducation]} disabled={true} />);
      
      const formElements = screen.getAllByRole('textbox');
      formElements.forEach(element => {
        expect(element).toBeDisabled();
      });
    });

    it('enables all form fields when disabled prop is false', () => {
      render(<EducationSection educations={[mockEducation]} disabled={false} />);
      
      const formElements = screen.getAllByRole('textbox');
      formElements.forEach(element => {
        expect(element).not.toBeDisabled();
      });
    });

    it('enables all form fields by default', () => {
      render(<EducationSection educations={[mockEducation]} />);
      
      const formElements = screen.getAllByRole('textbox');
      formElements.forEach(element => {
        expect(element).not.toBeDisabled();
      });
    });
  });

  describe('Multiple Education Entries', () => {
    it('renders multiple education entries with correct indexing', () => {
      render(<EducationSection educations={mockEducationArray} />);
      
      // Check first education
      expect(screen.getByDisplayValue("Bachelor of Science")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Stanford University")).toBeInTheDocument();
      
      // Check second education
      expect(screen.getByDisplayValue("Master of Science")).toBeInTheDocument();
      expect(screen.getByDisplayValue("MIT")).toBeInTheDocument();
      
      // Check that form names have correct indices
      expect(screen.getByDisplayValue("Bachelor of Science")).toHaveAttribute('name', 'education[0][degree]');
      expect(screen.getByDisplayValue("Master of Science")).toHaveAttribute('name', 'education[1][degree]');
    });

    it('displays correct numbering badges for multiple entries', () => {
      render(<EducationSection educations={mockEducationArray} />);
      
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe('Icons and Styling', () => {
    it('renders all expected icons', () => {
      render(<EducationSection educations={[mockEducation]} />);
      
      // Check for graduation cap icons
      expect(document.querySelector('.graduation-cap')).toBeInTheDocument();
      
      // Check for other icons
      expect(document.querySelector('.book-open')).toBeInTheDocument();
      expect(document.querySelector('.school')).toBeInTheDocument();
      expect(document.querySelector('.calendar')).toBeInTheDocument();
      expect(document.querySelector('.file-text')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing field_of_study gracefully', () => {
      const educationNoField = { ...mockEducation, field_of_study: "" };
      render(<EducationSection educations={[educationNoField]} />);
      
      expect(screen.getByText("Bachelor of Science")).toBeInTheDocument();
      expect(screen.queryByText("in")).not.toBeInTheDocument();
    });

    it('handles missing institution gracefully', () => {
      const educationNoInstitution = { ...mockEducation, institution: "" };
      render(<EducationSection educations={[educationNoInstitution]} />);
      
      // Should still render the degree
      expect(screen.getByText("Bachelor of Science")).toBeInTheDocument();
      
      // Institution field should still be present but empty
      expect(screen.getByRole('textbox', { name: /institution/i })).toHaveValue("");
    });

    it('handles missing degree gracefully', () => {
      const educationNoDegree = { ...mockEducation, degree: "" };
      render(<EducationSection educations={[educationNoDegree]} />);
      
      // Should show fallback text
      expect(screen.getByText("Degree")).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('allows user input in form fields when not disabled', () => {
      render(<EducationSection educations={[mockEducation]} />);
      
      const degreeInput = screen.getByDisplayValue("Bachelor of Science");
      fireEvent.change(degreeInput, { target: { value: "Master of Science" } });
      
      expect(degreeInput).toHaveValue("Master of Science");
    });

    it('prevents user input in form fields when disabled', () => {
      render(<EducationSection educations={[mockEducation]} disabled={true} />);
      
      const degreeInput = screen.getByDisplayValue("Bachelor of Science");
      expect(degreeInput).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper label associations', () => {
      render(<EducationSection educations={[mockEducation]} />);
      
      expect(screen.getByLabelText(/degree title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/field of study/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/institution/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  
    it('has proper form structure with unique IDs', () => {
      render(<EducationSection educations={mockEducationArray} />);
      const degreeInputs = screen.getAllByRole('textbox', { name: /degree title/i });
      // Assert against the first element in the returned array
      expect(degreeInputs[0]).toHaveAttribute('id', 'education[0][degree]');
      // Assert against the second element
      expect(degreeInputs[1]).toHaveAttribute('id', 'education[1][degree]');
    });
  });
});