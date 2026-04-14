export default function Unauthorized() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
        <p className="text-zinc-500">You are not allowed to access this page.</p>
      </div>
    </main>
  );
}
