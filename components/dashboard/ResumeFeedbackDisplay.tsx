import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeCoachingData } from "@/app/types/resume-coaching";

type CoachingData = ResumeCoachingData;

export default function ResumeFeedbackDisplay({
  coaching,
  resumeUrl,
}: {
  coaching: CoachingData;
  resumeUrl?: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80)
      return <CheckCircle className="w-6 h-6 text-emerald-600" />;
    if (score >= 60) return <TrendingUp className="w-6 h-6 text-amber-600" />;
    return <AlertTriangle className="w-6 h-6 text-rose-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  const categories = [
    {
      key: "ats",
      title: "ATS Compatibility",
      data: coaching.ats,
      description: "How well your resume works with applicant tracking systems",
    },
    {
      key: "tone_and_style",
      title: "Tone & Style",
      data: coaching.tone_and_style,
      description: "Professional language and writing quality",
    },
    {
      key: "content",
      title: "Content Quality",
      data: coaching.content,
      description: "Relevance and impact of your experience",
    },
    {
      key: "structure",
      title: "Structure",
      data: coaching.structure,
      description: "Organization and formatting",
    },
    {
      key: "skills",
      title: "Skills Section",
      data: coaching.skills,
      description: "Technical and soft skills presentation",
    },
  ];
  const router = useRouter();
  const handleRefresh = () => {
    // router.refresh(); // Soft-reloads the current route
    window.location.reload();
  };

  return (
    <div className="w-full mx-auto min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* PDF Viewer Section */}
        {resumeUrl && (
          <div className="lg:w-1/2 lg:sticky lg:top-6 lg:self-start">
            <Card className="shadow-xl border-slate-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full h-[500px] lg:h-[calc(100vh-180px)] bg-slate-100">
                  <iframe
                    src={resumeUrl}
                    className="w-full h-full"
                    title="Resume PDF"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feedback Section */}
        <div
          className={`${resumeUrl ? "lg:w-1/2" : "w-full max-w-4xl mx-auto"} space-y-6`}
        >
          {/* Overall Score Card with Progress Ring */}
          <Card
            className={`${getScoreBgColor(coaching.overall_score)} border-2 shadow-xl`}
          >
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
                    Overall Resume Score
                  </CardTitle>
                  <p className="text-sm text-slate-600 font-medium">
                    {getScoreLabel(coaching.overall_score)}
                  </p>
                </div>
                <div className="relative flex items-center justify-center">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - coaching.overall_score / 100)}`}
                      className={`${getScoreColor(coaching.overall_score)} transition-all duration-1000 ease-out`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {getScoreIcon(coaching.overall_score)}
                    <span
                      className={`text-3xl font-bold ${getScoreColor(coaching.overall_score)} mt-1`}
                    >
                      {Math.round(coaching.overall_score)}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                {coaching.overall_explanation}
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {categories.map((category) => (
              <Card
                key={category.key}
                className="shadow-md hover:shadow-lg transition-shadow duration-200 border-slate-200"
              >
                <CardContent className="p-4 text-center">
                  <div
                    className={`text-2xl font-bold ${getScoreColor(category.data.score)} mb-1`}
                  >
                    {category.data.score}
                  </div>
                  <div className="text-xs font-medium text-slate-600">
                    {category.title}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Category Sections */}
          {categories.map((category) => (
            <FeedbackSection
              key={category.key}
              title={category.title}
              description={category.description}
              score={category.data.score}
              tips={category.data.tips}
              scoreColor={getScoreColor(category.data.score)}
              scoreBgColor={getScoreBgColor(category.data.score)}
              scoreIcon={getScoreIcon(category.data.score)}
              scoreLabel={getScoreLabel(category.data.score)}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-center">
        <Button
          className="w-full sm:w-auto rounded-full bg-orange-500 hover:bg-orange-600 transition-all"
          onClick={handleRefresh}
        >
          Evaluate Another Resume
        </Button>
      </div>
    </div>
  );
}

type Tip = {
  type: string;
  tip: string;
  explanation: string;
};

type FeedbackSectionProps = {
  title: string;
  description: string;
  score: number;
  tips: Tip[];
  scoreColor: string;
  scoreBgColor: string;
  scoreIcon: React.ReactNode;
  scoreLabel: string;
};

function FeedbackSection({
  title,
  description,
  score,
  tips,
  scoreColor,
  scoreBgColor,
  scoreIcon,
  scoreLabel,
}: FeedbackSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTipIcon = (type: string) => {
    switch (type) {
      case "good":
        return (
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        );
      case "improve":
        return <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0" />;
      case "warning":
        return (
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
        );
      case "error":
        return <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
      default:
        return <div className="w-5 h-5 flex-shrink-0" />;
    }
  };

  const getTipBgColor = (type: string) => {
    switch (type) {
      case "good":
        return "bg-emerald-50 border-emerald-200 hover:bg-emerald-100";
      case "improve":
        return "bg-amber-50 border-amber-200 hover:bg-amber-100";
      case "warning":
        return "bg-orange-50 border-orange-200 hover:bg-orange-100";
      case "error":
        return "bg-rose-50 border-rose-200 hover:bg-rose-100";
      default:
        return "bg-slate-50 border-slate-200 hover:bg-slate-100";
    }
  };

  const getTipBadgeVariant = (type: string) => {
    switch (type) {
      case "good":
        return "good";
      case "improve":
        return "improve";
      default:
        return "default";
    }
  };

  return (
    <Card
      className={`${scoreBgColor} border-2 shadow-lg hover:shadow-xl transition-shadow duration-200`}
    >
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-white/30 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <CardTitle className="text-xl font-bold text-slate-800">
                {title}
              </CardTitle>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
          <div className="flex flex-col items-center gap-1 ml-4">
            {scoreIcon}
            <span className={`text-2xl font-bold ${scoreColor}`}>{score}</span>
            <span className="text-xs font-medium text-slate-600">
              {scoreLabel}
            </span>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3 pt-2">
          {tips.map((tip, index) => (
            <div
              key={index}
              className={`flex gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${getTipBgColor(tip.type)}`}
            >
              <div className="mt-0.5">{getTipIcon(tip.type)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2">
                  <Badge
                    variant={getTipBadgeVariant(tip.type)}
                    className="text-xs font-semibold mt-0.5"
                  >
                    {tip.type.charAt(0).toUpperCase() + tip.type.slice(1)}
                  </Badge>
                  <h4 className="font-semibold text-slate-900 leading-snug">
                    {tip.tip}
                  </h4>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {tip.explanation}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
