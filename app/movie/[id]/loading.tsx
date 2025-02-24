function loading() {
  return (
    <div className="min-h-screen bg-slate-900 animate-pulse">
      <div className="relative h-[31rem] md:h-[35rem] lg:h-[45rem] bg-slate-700"></div>

      <div className="container mx-auto px-4 lg:-mt-[26rem] sm:-mt-[14rem] md:-mt-[16rem] relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster Skeleton */}
          <div className="w-auto">
            <div className="relative lg:h-[30rem] sm:h-[18rem] md:[22rem] lg:w-[20rem] sm:w-[12rem] md:w-[16rem] rounded-xl overflow-hidden bg-slate-700"></div>
          </div>

          {/* Details Skeleton */}
          <div className="w-full md:w-2/3 text-white">
            <div className="h-10 w-3/4 bg-slate-700 rounded mb-4"></div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-6 w-20 bg-slate-700 rounded"></div>
              <div className="h-6 w-28 bg-slate-700 rounded"></div>
              <div className="h-6 w-16 bg-slate-700 rounded"></div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="h-8 w-20 bg-cyan-700 rounded-full"></div>
              <div className="h-8 w-24 bg-cyan-700 rounded-full"></div>
              <div className="h-8 w-18 bg-cyan-700 rounded-full"></div>
            </div>

            <div className="h-24 bg-slate-700 rounded mb-8"></div>

            <div className="h-12 w-40 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default loading;
