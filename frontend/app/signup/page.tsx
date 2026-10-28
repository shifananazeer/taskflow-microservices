
import SignupForm from "../../components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:min-h-[650px] md:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#172554] via-[#1d4ed8] to-[#4338ca] p-12 text-white md:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-blue-300/10" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-extrabold text-blue-700">
              T
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Taskflow
            </span>
          </div>

          <div className="relative z-10">
            <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              Your productivity workspace
            </div>

            <h1 className="max-w-md text-4xl font-bold leading-tight lg:text-5xl">
              Start organizing. Start achieving.
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
              Create your account and bring your tasks, priorities, and
              progress together in one place.
            </p>

            <div className="mt-9 space-y-4 text-sm text-blue-50">
              <p>✓ Create and organize tasks</p>
              <p>✓ Track your progress</p>
              <p>✓ Stay focused on your goals</p>
            </div>
          </div>

          <p className="relative z-10 text-sm text-blue-200">
            A simpler way to manage your work.
          </p>
        </section>

        <SignupForm />
      </div>
    </main>
  );
}
