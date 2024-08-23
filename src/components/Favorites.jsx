import { useGlobalContext } from "../context/AppContext";

export default function Favorites() {
  const { favorites, selectMeal, removeFavorites } = useGlobalContext();
  return (
    <section className="favorites">
      <div className="favorites-content">
        <h5>Favorites</h5>
        <div className="favorites-container">
          {favorites.map((item) => {
            const { idMeal, strMealThumb: image } = item;

            return (
              <div key={idMeal} className="favorite-item">
                <img
                  src={image}
                  alt="food item"
                  className="favorites-img img"
                  onClick={() => selectMeal(idMeal, true)}
                />
                <button
                  className="remove-btn"
                  onClick={() => removeFavorites(idMeal)}
                >
                  remove
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
