"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParticipateModal } from "@/components/dashboard/ParticipateModal";
import type { JobPost } from "@/app/types/types";
import { Search, MapPin, Building2, Briefcase } from "lucide-react";

// Mock data for development
const MOCK_JOB_POSTS: JobPost[] = [
  {
    id: "1",
    jobPostId: "1",
    companyName: "TechStart Inc",
    companyProfile:
      "TechStart Inc is a leading software development company based in San Francisco, California. We specialize in building custom software solutions for clients across various industries. Our team of experienced developers and designers work closely with clients to deliver high-quality, innovative, and cost-effective solutions.",
    jobTitle: "Senior Frontend Developer",
    jobLocation: "San Francisco, CA",
    jobDescription:
      "We're looking for an experienced Frontend Developer to join our growing team. You'll be working on cutting-edge web applications using React, TypeScript, and modern web technologies. This role offers the opportunity to shape our product's user experience and work with a talented team of engineers.",
    jobRequirements:
      "5+ years of experience with React, Strong TypeScript skills, Experience with modern CSS frameworks",
    coreSkills: "React, TypeScript, CSS, HTML, JavaScript",
    niceToHaveSkills: "Next.js, Tailwind CSS, GraphQL",
    perks:
      "Competitive salary, Health insurance, 401k matching, Flexible work hours, Remote work options",
    screeningQuestions: [
      {
        question:
          "Describe your experience with React and TypeScript. What projects have you built?",
      },
      {
        question:
          "How do you approach performance optimization in frontend applications?",
      },
    ],
    // createdAt: new Date("2024-01-15"),
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    jobPostId: "2",
    companyName: "DataFlow Analytics",
    companyProfile:
      "DataFlow Analytics is a leading data analytics company based in New York, New York. We specialize in building custom data analytics solutions for clients across various industries. Our team of experienced data scientists and analysts work closely with clients to deliver high-quality, innovative, and cost-effective solutions.",
    jobTitle: "Full Stack Engineer",
    jobLocation: "New York, NY",
    jobDescription:
      "Join our team to build scalable data analytics platforms. You'll work across the entire stack, from designing APIs to creating intuitive user interfaces. We value clean code, collaboration, and continuous learning.",
    jobRequirements:
      "3+ years full stack development, Experience with Node.js and React, Database design skills",
    coreSkills: "Node.js, React, PostgreSQL, REST APIs, Docker",
    niceToHaveSkills: "AWS, Kubernetes, Redis, Microservices",
    perks:
      "Stock options, Unlimited PTO, Learning budget, Modern office space, Team lunches",
    screeningQuestions: [
      {
        question:
          "Tell us about a challenging full stack project you've completed.",
      },
      { question: "How do you handle database scaling and optimization?" },
      { question: "What's your approach to writing testable code?" },
    ],
    // createdAt: new Date("2024-01-20"),
    updatedAt: "2024-01-20",
  },
  {
    id: "3",
    jobPostId: "3",
    companyName: "CloudNine Solutions",
    companyProfile:
      "CloudNine Solutions is a leading cloud solutions company based in Austin, Texas. We specialize in building custom cloud solutions for clients across various industries. Our team of experienced cloud engineers and designers work closely with clients to deliver high-quality, innovative, and cost-effective solutions.",
    jobTitle: "Backend Developer",
    jobLocation: "Austin, TX",
    jobDescription:
      "We're seeking a Backend Developer to design and implement robust server-side applications. You'll be responsible for building APIs, optimizing database queries, and ensuring our infrastructure scales smoothly.",
    jobRequirements:
      "4+ years backend development, Strong knowledge of Python or Node.js, Experience with cloud platforms",
    coreSkills: "Python, Django, PostgreSQL, AWS, Redis",
    niceToHaveSkills: "Kubernetes, MongoDB, RabbitMQ, Elasticsearch",
    perks:
      "Remote-first culture, Conference budget, Home office stipend, Health and dental insurance",
    screeningQuestions: [
      {
        question:
          "Describe your experience with API design and RESTful services.",
      },
    ],
    // createdAt: new Date("2024-01-18"),
    updatedAt: "2024-01-18",
  },
  {
    id: "4",
    jobPostId: "4",
    companyName: "Mobile First Labs",
    companyProfile:
      "Mobile First Labs is a leading mobile development company based in Remote, Texas. We specialize in building custom mobile solutions for clients across various industries. Our team of experienced mobile engineers and designers work closely with clients to deliver high-quality, innovative, and cost-effective solutions.",
    jobTitle: "React Native Developer",
    jobLocation: "Remote",
    jobDescription:
      "Build beautiful, performant mobile applications for iOS and Android. We're a startup focused on revolutionizing mobile commerce. You'll have the opportunity to work on greenfield projects and influence technical decisions.",
    jobRequirements:
      "2+ years React Native experience, Published apps on App Store and Play Store, Understanding of mobile UX principles",
    coreSkills: "React Native, JavaScript, iOS, Android, Redux",
    niceToHaveSkills:
      "TypeScript, Firebase, Push notifications, In-app purchases",
    perks:
      "Fully remote, Flexible hours, Equity options, New MacBook Pro, Annual team retreats",
    screeningQuestions: [
      { question: "What mobile apps have you built and what was your role?" },
      { question: "How do you handle offline functionality in mobile apps?" },
    ],
    // createdAt: new Date("2024-01-22"),
    updatedAt: "2024-01-22",
  },
  {
    id: "5",
    jobPostId: "5",
    companyName: "FinTech Innovations",
    companyProfile:
      "FinTech Innovations is a leading financial technology company based in Boston, Massachusetts. We specialize in building custom financial solutions for clients across various industries. Our team of experienced financial engineers and designers work closely with clients to deliver high-quality, innovative, and cost-effective solutions.",
    jobTitle: "Senior Software Engineer",
    jobLocation: "Boston, MA",
    jobDescription:
      "Join our engineering team to build secure, scalable financial technology solutions. We work with cutting-edge technologies and handle millions of transactions daily. Security and reliability are paramount in everything we do.",
    jobRequirements:
      "6+ years software development, Experience in fintech or regulated industries, Strong understanding of security best practices",
    coreSkills: "Java, Spring Boot, Microservices, Security, SQL",
    niceToHaveSkills: "Kafka, Terraform, CI/CD, Compliance knowledge",
    perks:
      "Competitive compensation, Annual bonus, 401k with match, Premium healthcare, Professional development",
    screeningQuestions: [
      {
        question:
          "Describe your experience with secure software development practices.",
      },
      { question: "How do you approach building fault-tolerant systems?" },
      {
        question: "What's your experience with financial or regulated systems?",
      },
    ],
    // createdAt: new Date("2024-01-10"),
    updatedAt: "2024-01-10",
  },
  {
    id: "6",
    jobPostId: "6",
    companyName: "GreenTech Energy",
    companyProfile:
      "GreenTech Energy is a leading renewable energy company based in Seattle, Washington. We specialize in building custom renewable energy solutions for clients across various industries. Our team of experienced renewable energy engineers and designers work closely with clients to deliver high-quality, innovative, and cost-effective solutions.",
    jobTitle: "Junior Frontend Developer",
    jobLocation: "Seattle, WA",
    jobDescription:
      "Start your career with us! We're looking for an enthusiastic junior developer who wants to make a difference in the renewable energy sector. You'll learn from experienced mentors while contributing to meaningful projects.",
    jobRequirements:
      "1+ year of web development experience, Knowledge of HTML, CSS, JavaScript, Passion for learning",
    coreSkills: "HTML, CSS, JavaScript, Git, Responsive Design",
    niceToHaveSkills: "React, Vue.js, SASS, Webpack",
    perks:
      "Mentorship program, Learning opportunities, Health insurance, Casual work environment, Mission-driven company",
    screeningQuestions: [
      {
        question:
          "What interests you about working in the renewable energy sector?",
      },
      { question: "Tell us about a web project you're proud of." },
    ],
    // createdAt: new Date("2024-01-25"),
    updatedAt: "2024-01-25",
  },
];

export default function JobSearchPage() {
  const [jobPosts, setJobPosts] = useState<JobPost[]>(MOCK_JOB_POSTS);
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>(MOCK_JOB_POSTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>("mock-profile-id");
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  // Mock API calls - replace with real API calls when ready
  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     try {
  //       const response = await fetch("/api/jobseeker/profile");
  //       if (response.ok) {
  //         const data = await response.json();
  //         setProfileId(data.id);
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch profile:", err);
  //     }
  //   };
  //   fetchProfile();
  // }, []);

  // useEffect(() => {
  //   const fetchJobPosts = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await fetch("/api/job-posts");
  //       if (!response.ok) throw new Error("Failed to fetch job posts");
  //       const data = await response.json();
  //       setJobPosts(data);
  //       setFilteredJobs(data);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : "An error occurred");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchJobPosts();
  // }, []);

  // useEffect(() => {
  //   const fetchAppliedJobs = async () => {
  //     if (!profileId) return;
  //     try {
  //       const response = await fetch(`/api/applications?profileId=${profileId}`);
  //       if (response.ok) {
  //         const data = await response.json();
  //         const applied = new Set(data.map((app: any) => app.jobPostId));
  //         setAppliedJobs(applied);
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch applied jobs:", err);
  //     }
  //   };
  //   fetchAppliedJobs();
  // }, [profileId]);

  // Filter jobs based on search criteria
  useEffect(() => {
    let filtered = jobPosts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.jobTitle?.toLowerCase().includes(query) ||
          job.companyName?.toLowerCase().includes(query) ||
          job.jobDescription?.toLowerCase().includes(query) ||
          job.coreSkills?.toLowerCase().includes(query),
      );
    }

    if (locationQuery) {
      const location = locationQuery.toLowerCase();
      filtered = filtered.filter((job) =>
        job.jobLocation?.toLowerCase().includes(location),
      );
    }

    setFilteredJobs(filtered);
  }, [searchQuery, locationQuery, jobPosts]);

  const handleApply = (job: JobPost) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const handleApplicationSuccess = () => {
    if (selectedJob?.id) {
      setAppliedJobs((prev) => new Set([...prev, selectedJob.id]));
    }
    // Mock success - in production, this would trigger a real API call
    console.log("Application submitted successfully for job:", selectedJob?.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading job posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Next Opportunity</h1>
        <p className="text-muted-foreground">
          Discover jobs that match your skills and aspirations
        </p>
      </div>

      {/* Search Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by job title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Location"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}{" "}
          found
        </p>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No jobs found matching your criteria. Try adjusting your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => {
            const hasApplied = appliedJobs.has(job.id);
            return (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{job.jobTitle}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {job.companyName && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span>{job.companyName}</span>
                          </div>
                        )}
                        {job.jobLocation && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.jobLocation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleApply(job)}
                      disabled={!profileId || hasApplied}
                      className="rounded-full bg-orange-500 hover:bg-orange-600"
                    >
                      {hasApplied ? "Applied" : "Apply Now"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.jobDescription && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {job.jobDescription}
                      </p>
                    </div>
                  )}

                  {job.coreSkills && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.coreSkills
                          .split(",")
                          .slice(0, 5)
                          .map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-orange-100 text-orange-800 hover:bg-orange-200 px-3 py-1 text-sm font-medium"
                            >
                              {skill.trim()}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {job.perks && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Perks</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.perks}
                      </p>
                    </div>
                  )}

                  {job.screeningQuestions &&
                    job.screeningQuestions.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>
                          {job.screeningQuestions.length} screening{" "}
                          {job.screeningQuestions.length === 1
                            ? "question"
                            : "questions"}
                        </span>
                      </div>
                    )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Participate Modal */}
      <ParticipateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        jobPost={selectedJob}
        profileId={profileId || undefined}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}
