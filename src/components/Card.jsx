export default function Card({ children }) {
  return (
    <div className="w-full md:w-full lg:w-fit max-w-full mx-auto rounded border p-4 bg-white shadow h-fit">
      {children}
    </div>
  );
}
