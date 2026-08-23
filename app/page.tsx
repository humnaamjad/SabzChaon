export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-6 text-center px-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sabz Chaon
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
          Project scaffold ready. Individual parts are being built by team
          members on top of this shared foundation.
        </p>
        <div className="flex flex-col gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              /auth
            </span>{" "}
            — Authentication (Part 1)
          </p>
          <p>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              /(ngo)/dashboard
            </span>{" "}
            — NGO Dashboard (Part 2)
          </p>
          <p>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              /(volunteer)/campaigns
            </span>{" "}
            — Browse Campaigns (Part 3)
          </p>
          <p>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              /api/ai/analyze-tree-photo
            </span>{" "}
            — AI Health Check (Part 4)
          </p>
        </div>
      </main>
    </div>
  );
}
