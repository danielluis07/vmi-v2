import { Categories } from "@/components/home/categories";
import { Events } from "@/components/home/events";
import { Hero } from "@/components/home/hero";

const dummyCategories = [
  { id: "1", name: "Category 1" },
  { id: "2", name: "Category 2" },
  { id: "3", name: "Category 3" },
  { id: "4", name: "Category 4" },
  { id: "5", name: "Category 5" },
  { id: "6", name: "Category 6" },
  { id: "7", name: "Category 7" },
  { id: "8", name: "Category 8" },
  { id: "9", name: "Category 9" },
  { id: "10", name: "Category 10" },
  { id: "11", name: "Category 11" },
  { id: "12", name: "Category 12" },
  { id: "13", name: "Category 13" },
  { id: "14", name: "Category 14" },
  { id: "15", name: "Category 15" },
  { id: "16", name: "Category 16" },
  { id: "17", name: "Category 17" },
  { id: "18", name: "Category 18" },
  { id: "19", name: "Category 19" },
  { id: "20", name: "Category 20" },
];

export default function Home() {
  return (
    <div>
      <Hero />
      <div className="px-0 sm:px-3 md:px-10 lg:px-20">
        <Categories data={dummyCategories} />
        <Events />
      </div>
    </div>
  );
}
