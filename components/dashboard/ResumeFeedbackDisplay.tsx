import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, TrendingUp, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type CoachingData = {
  overall_explanation: string;
  ats: {
    score: number;
    tips: Array<{
      type: string;
      tip: string;
      explanation: string;
    }>;
  };
  tone_and_style: {
    score: number;
    tips: Array<{
      type: string;
      tip: string;
      explanation: string;
    }>;
  };
  content: {
    score: number;
    tips: Array<{
      type: string;
      tip: string;
      explanation: string;
    }>;
  };
  structure: {
    score: number;
    tips: Array<{
      type: string;
      tip: string;
      explanation: string;
    }>;
  };
  skills: {
    score: number;
    tips: Array<{
      type: string;
      tip: string;
      explanation: string;
    }>;
  };
  overall_score: number;
};

export default function ResumeFeedbackDisplay({
  coaching,
  resumeUrl,
}: {
  coaching: CoachingData;
  resumeUrl?: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (score >= 60) return <TrendingUp className="w-6 h-6 text-yellow-600" />;
    return <AlertTriangle className="w-6 h-6 text-red-600" />;
  };

  return (
    <div className="w-full mx-auto">
      {/* Side-by-side layout with independent scrolling */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-screen">
        {/* PDF Viewer Section - Sticky */}
        {resumeUrl && (
          <div className="lg:w-1/2 lg:sticky lg:top-0 lg:self-start">
            <Card className="lg:max-h-screen">
              <CardHeader className="pb-3">
                <CardTitle>Original Resume</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[500px] lg:h-[calc(100vh-200px)] border border-gray-200 rounded-lg overflow-hidden">
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

        {/* Feedback Section - Scrollable */}
        <div className={`${resumeUrl ? 'lg:w-1/2' : 'w-full max-w-4xl mx-auto'} space-y-6 lg:overflow-y-auto`}>
          {/* Overall Score Card */}
          <Card className={`${getScoreBgColor(coaching.overall_score)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Overall Resume Score</CardTitle>
                <div className="flex items-center space-x-2">
                  {getScoreIcon(coaching.overall_score)}
                  <span
                    className={`text-3xl font-bold ${getScoreColor(coaching.overall_score)}`}
                  >
                    {Math.round(coaching.overall_score)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{coaching.overall_explanation}</p>
            </CardContent>
          </Card>

          {/* Category Sections */}
          <FeedbackSection
            title="ATS Compatibility"
            score={coaching.ats.score}
            tips={coaching.ats.tips}
            scoreColor={getScoreColor(coaching.ats.score)}
            scoreBgColor={getScoreBgColor(coaching.ats.score)}
            scoreIcon={getScoreIcon(coaching.ats.score)}
          />

          <FeedbackSection
            title="Tone and Style"
            score={coaching.tone_and_style.score}
            tips={coaching.tone_and_style.tips}
            scoreColor={getScoreColor(coaching.tone_and_style.score)}
            scoreBgColor={getScoreBgColor(coaching.tone_and_style.score)}
            scoreIcon={getScoreIcon(coaching.tone_and_style.score)}
          />

          <FeedbackSection
            title="Content Quality"
            score={coaching.content.score}
            tips={coaching.content.tips}
            scoreColor={getScoreColor(coaching.content.score)}
            scoreBgColor={getScoreBgColor(coaching.content.score)}
            scoreIcon={getScoreIcon(coaching.content.score)}
          />

          <FeedbackSection
            title="Resume Structure"
            score={coaching.structure.score}
            tips={coaching.structure.tips}
            scoreColor={getScoreColor(coaching.structure.score)}
            scoreBgColor={getScoreBgColor(coaching.structure.score)}
            scoreIcon={getScoreIcon(coaching.structure.score)}
          />

          <FeedbackSection
            title="Skills Section"
            score={coaching.skills.score}
            tips={coaching.skills.tips}
            scoreColor={getScoreColor(coaching.skills.score)}
            scoreBgColor={getScoreBgColor(coaching.skills.score)}
            scoreIcon={getScoreIcon(coaching.skills.score)}
          />
        </div>
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
  score: number;
  tips: Tip[];
  scoreColor: string;
  scoreBgColor: string;
  scoreIcon: React.ReactNode;
};

function FeedbackSection({
  title,
  score,
  tips,
  scoreColor,
  scoreBgColor,
  scoreIcon,
}: FeedbackSectionProps) {
  const getTipIcon = (type: string) => {
    switch (type) {
      case "good":
        return (
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
        );
      case "improve":
        return (
          <TrendingUp className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        );
      case "warning":
        return (
          <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
        );
      case "error":
        return (
          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
        );
      default:
        return <div className="w-4 h-4 mt-0.5 flex-shrink-0" />;
    }
  };

  const getTipBadgeVariant = (type: string) => {
    switch (type) {
      case "good":
        return "good";
      case "improve":
        return "improve";
    }
  };

  return (
    <Card className={scoreBgColor}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {scoreIcon}
            <span className={`text-2xl font-bold ${scoreColor}`}>{score}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="flex space-x-3 p-3 bg-white rounded-lg border border-gray-100"
          >
            <div className="flex-shrink-0">{getTipIcon(tip.type)}</div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Badge
                  variant={getTipBadgeVariant(tip.type)}
                  className="text-xs"
                >
                  {tip.type.charAt(0).toUpperCase() + tip.type.slice(1)}
                </Badge>
                <h4 className="font-medium text-gray-900">{tip.tip}</h4>
              </div>
              <p className="text-sm text-gray-600">{tip.explanation}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
