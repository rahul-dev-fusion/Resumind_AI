import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Resumind.AI | Wipe" },
  { name: "description", content: "wipes off ur all uploads" },
];


const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const loadFiles = async () => {
    const files = (await fs.readDir("./")) as FSItem[];
    setFiles(files);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);

  const handleDelete = async () => {
    // kept for compatibility if called directly — show modal instead
    setShowConfirm(true);
  };

  const doDelete = async () => {
    setIsWiping(true);
    try {
      for (const file of files) {
        try {
          await fs.delete(file.path);
        } catch (e) {
          // ignore single-file errors and continue
        }
      }
      try {
        await kv.flush();
      } catch (e) {
        // ignore
      }
      await loadFiles();
    } finally {
      setIsWiping(false);
      setShowConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="wipe-page">
        <div className="soft-card">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wipe-page">
        <div className="soft-card">Error: {String(error)}</div>
      </div>
    );
  }

  return (
    <main className="wipe-page">
      <header className="page-heading">
        <h1 className="text-gradient">Wipe App Data</h1>
        <p className="text-dark-200">
          Permanently remove all stored files and cached data.
        </p>
      </header>

      <section className="wipe-card soft-card">
        <div className="flex flex-row justify-between items-center w-full mb-4">
          <div>
            <div className="text-sm text-dark-200">Authenticated as</div>
            <div className="font-semibold">{auth.user?.username ?? "—"}</div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="back-button"
              onClick={() => loadFiles()}
              title="Refresh file list"
            >
              Refresh
            </button>
            <button
              type="button"
              className={`danger-button ${files.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleDelete()}
              disabled={files.length === 0 || isWiping}
            >
              {isWiping ? "Wiping..." : "Wipe App Data"}
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-dark-200">Existing files</h2>

          {files.length === 0 ? (
            <div className="empty-state">No files found.</div>
          ) : (
            <ul className="file-list">
              {files.map((file) => (
                <li key={file.id} className="file-item">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center text-gray-500">
                      <img src="images/pdf.png" alt="upload" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-dark-200">
                        {file.path ?? file.name}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      {/* Confirmation modal */}
      {showConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card soft-card">
            <h3 className="text-lg font-semibold">Confirm Wipe</h3>
            <p className="text-dark-200 mt-2">
              This will permanently delete all app files and flush the key-value
              store. This action cannot be undone.
            </p>

            <div className="modal-actions mt-6 flex gap-3 justify-end">
              <button
                type="button"
                className="back-button"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => doDelete()}
                disabled={isWiping}
              >
                {isWiping ? "Wiping..." : "Confirm Wipe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default WipeApp;
