export function BlobbyLogo() {
  return (
    <div className="mx-auto flex w-fit items-center gap-4 rounded-full border border-white/10 bg-white/5 px-6 py-4 shadow-2xl">
      <div className="relative h-16 w-24">
        <div className="absolute left-0 top-2 h-14 w-14 rounded-full bg-red-500 shadow-[0_0_35px_rgba(248,113,113,0.75)]" />
        <div className="absolute right-0 top-2 h-14 w-14 rounded-full bg-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.75)]" />
        <div className="absolute left-5 top-0 h-16 w-16 rounded-full border-2 border-white/30 bg-slate-950/45 backdrop-blur" />
        <div className="absolute left-10 top-6 h-2 w-2 rounded-full bg-white" />
        <div className="absolute left-14 top-6 h-2 w-2 rounded-full bg-white" />
      </div>
      <div className="text-left">
        <p className="text-xs uppercase tracking-[0.45em] text-sky-300">by deveraste</p>
        <p className="text-3xl font-black tracking-wider"><span className="text-red-400">BLO</span><span className="text-sky-300">BBY</span></p>
      </div>
    </div>
  );
}
