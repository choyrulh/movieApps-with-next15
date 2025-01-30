export default function SearchBar() {
  return (
    <form className="flex items-center space-x-2 border rounded-md p-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 flex-none text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        className="w-full bg-inherit outline-none appearance-none placeholder-gray-500 text-gray-500 sm:w-auto"
        type="text"
        placeholder="Search"
      />
    </form>
  );
}
