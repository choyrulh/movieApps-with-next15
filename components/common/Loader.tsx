export const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      <span className="text-slate-400">Loading movies...</span>
    </div>
  );
};
