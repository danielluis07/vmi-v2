import { NextEvents } from "@/components/home/next-events";

const TestPage = () => {
  return (
    <div className="pt-20 px-0 sm:px-3 md:px-10 lg:px-20 xl:px-42">
      <NextEvents isLoading />
    </div>
  );
};

export default TestPage;
