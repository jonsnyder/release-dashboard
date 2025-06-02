export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">
          Release Automation
        </h1>
        <p className="text-lg mb-4">
          A tool for automating software releases and deployments.
        </p>
        <a
          href="https://github.com/your-username/release-automation"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          View on GitHub
        </a>
      </div>
    </main>
  );
}
