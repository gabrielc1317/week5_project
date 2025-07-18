import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [viewedHistory, setViewedHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const [dashboardFilter, setDashboardFilter] = useState("");

  // Step 1: Fetch OAuth token
  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await axios.post("https://api.petfinder.com/v2/oauth2/token", {
          grant_type: "client_credentials",
          client_id: import.meta.env.VITE_PETFINDER_KEY,
          client_secret: import.meta.env.VITE_PETFINDER_SECRET
        });
        setToken(res.data.access_token);
      } catch (err) {
        console.error("Error getting token", err);
      }
    };

    getToken();
  }, []);

  // Step 2: Fetch pets once token is available
  useEffect(() => {
    if (!token) return;

    const fetchPets = async () => {
      try {
        const res = await axios.get("https://api.petfinder.com/v2/animals", {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            type: "Dog",
            location: "Miami, FL",
            limit: 10
          }
        });

        setPets(res.data.animals);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching pets", err);
      }
    };

    fetchPets();
  }, [token]);

  // Step 3: Filtered list based on dashboard filter (e.g., age)
  const filteredPets = pets.filter(pet =>
    dashboardFilter ? pet.age === dashboardFilter : true
  );

  // Step 4: Handle "Next" button and update history
  const handleNext = () => {
    if (filteredPets.length === 0) return;
    const currentPet = filteredPets[currentIndex];

    setViewedHistory(prev => {
      if (!prev.find(p => p.id === currentPet.id)) {
        return [...prev, currentPet];
      }
      return prev;
    });

    setCurrentIndex(prev => (prev + 1) % filteredPets.length);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🐾 Pets Available for Adoption</h1>

      {/* Age Filter */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Age:</label>
        <select
          value={dashboardFilter}
          onChange={(e) => {
            setDashboardFilter(e.target.value);
            setCurrentIndex(0);
          }}
          className="border p-1"
        >
          <option value="">All Ages</option>
          <option>Baby</option>
          <option>Young</option>
          <option>Adult</option>
          <option>Senior</option>
        </select>
      </div>

      {/* Main Dashboard */}
      {loading ? (
        <p>Loading pets...</p>
      ) : filteredPets.length === 0 ? (
        <p>No pets found for selected filter.</p>
      ) : (
        <div className="border p-4 rounded">
          <h2 className="font-semibold text-xl">{filteredPets[currentIndex].name}</h2>
          <p>
            {filteredPets[currentIndex].breeds.primary} •{" "}
            {filteredPets[currentIndex].age} •{" "}
            {filteredPets[currentIndex].gender}
          </p>
          {filteredPets[currentIndex].photos[0]?.medium && (
            <img
              src={filteredPets[currentIndex].photos[0].medium}
              alt={filteredPets[currentIndex].name}
              className="w-64 mt-2 rounded"
            />
          )}
          <a
            href={filteredPets[currentIndex].url}
            target="_blank"
            className="block text-blue-600 underline mt-2"
          >
            View Full Profile →
          </a>
        </div>
      )}

      {/* Next Button */}
      {!loading && filteredPets.length > 0 && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleNext}
        >
          Next ➜
        </button>
      )}

      {/* Searchable Viewed History */}
      <div className="mt-6">
        <h2 className="font-semibold text-lg mb-2">🕘 Previously Viewed</h2>

        <input
          type="text"
          placeholder="Search viewed pets by name or breed"
          value={historySearch}
          onChange={(e) => setHistorySearch(e.target.value)}
          className="border p-2 mb-3 w-full"
        />

        <ul className="space-y-1 text-sm">
          {viewedHistory
            .filter((pet) => {
              const q = historySearch.toLowerCase();
              return (
                pet.name.toLowerCase().includes(q) ||
                pet.breeds.primary.toLowerCase().includes(q)
              );
            })
            .map((pet) => (
              <li key={pet.id} className="border rounded p-2">
                <strong>{pet.name}</strong> – {pet.breeds.primary}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default App;