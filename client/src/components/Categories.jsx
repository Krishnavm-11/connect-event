import { Link } from "react-router-dom";
import { Code, Music, Briefcase, Trophy } from "lucide-react";

function Categories() {
  const categories = [
    { name: "Technology", icon: <Code size={34} /> },
    { name: "Music", icon: <Music size={34} /> },
    { name: "Business", icon: <Briefcase size={34} /> },
    { name: "Sports", icon: <Trophy size={34} /> },
  ];

  return (
    <section className="bg-slate-950 text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center">
          Popular Categories
        </h2>

        <p className="text-gray-400 text-center mt-3">
          Explore events based on your interests
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {categories.map((category, index) => (
            <Link
              to={`/events?category=${category.name}`}
              key={index}
              className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center hover:bg-blue-600 hover:border-blue-500 transition cursor-pointer shadow-lg"
            >
              <div className="flex justify-center mb-5 text-blue-400">
                {category.icon}
              </div>

              <h3 className="text-2xl font-semibold">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;