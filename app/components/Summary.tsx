import React from "react";
import ScoreGauge from "./ScoreGauge";
import ScoreBadge from "./ScoreBadge";

const CategoryScores = ({ title, score }: { title: string; score: number }) => {

  let textColor = score > 70 ? "text-green-600" : score > 49 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="resume-summary">
      <div className="category">
        <div className="flex flex-row gap-2 items-center justify-center">
          <p className="text-2xl">{title}</p>
          <ScoreBadge score={score} />
        </div>
        <p className="text-2xl">
          <span className={textColor}>{score}</span> / 100
        </p>
      </div>
    </div>
  );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md w-full">
      <div className="flex flex-row items-center p-4 gap-8">
        <ScoreGauge score={feedback.overallScore} />
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-2xl">Your resume Score</h2>
          <p className="text-sm text-gray-500">
            this score is calculated based on variable listed below.
          </p>
        </div>
      </div>

      <CategoryScores
        title="Tone & Style"
        score={feedback.toneAndStyle.score}
      />
      <CategoryScores title="Content" score={feedback.content.score} />
      <CategoryScores title="Structure" score={feedback.structure.score} />
      <CategoryScores title="Skills" score={feedback.skills.score} />
    </div>
  );
};

export default Summary;
