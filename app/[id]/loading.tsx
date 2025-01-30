import { Loader } from "@/components/common/Loader";

function loading() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader />
    </div>
  );
}

export default loading;
