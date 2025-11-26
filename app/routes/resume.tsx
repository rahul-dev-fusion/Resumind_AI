import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Resumind.AI | Review" },
  { name: "description", content: "Detailed overview of your resume" },
];

export default function Resume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fs, kv, auth, isLoading } = usePuterStore();

  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume${id}`);
  }, [isLoading]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      const stored = await kv.get(`resume:${id}`);
      if (!stored) return navigate("/");

      const data = JSON.parse(stored);

      // Load PDF
      const pdfBlob = await fs.read(data.resumePath);
      if (pdfBlob) {
        setResumeUrl(
          URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }))
        );
      }

      // Load Image
      const imgBlob = await fs.read(data.imagePath);
      if (imgBlob) {
        setImageUrl(URL.createObjectURL(imgBlob));
      }

      setFeedback(data.feedback);
    })();
  }, [id]);

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="Back" className="w-2.5 h-2.5" />
          <span className="text-sm font-semibold text-gray-800">
            Back to Home
          </span>
        </Link>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-2xl:h-fit w-fit">
              <a href={resumeUrl} target="_blank">
                <img
                  src={imageUrl}
                  className="w-full h-full rounded-2xl object-contain"
                  title="resume"
                />
              </a>
            </div>
          )}
        </section>

        <section className="feedback-section">
          <h2 className="text-4xl text-black font-bold">Resume Review</h2>
          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000 ">
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.tips || []}
              />
              <Details feedback={feedback} />
            </div>
          ) : (
            <img src="/images/resume-scan-2.gif" className="w-full" />
          )}
        </section>
      </div>
    </main>
  );
}
