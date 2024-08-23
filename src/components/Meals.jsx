import { useGlobalContext } from "../context/AppContext";
import { BsHandThumbsUp } from "react-icons/bs";

export default function Meals() {
  // const appContext = useGlobalContext();
  // console.log(appContext);
  const { loading, meals, selectMeal, addFavorites } = useGlobalContext();

  if (loading) {
    return (
      <section className="section">
        <h4>Loading...</h4>
      </section>
    );
  }

  if (meals.length < 1) {
    return (
      <section className="section">
        <h4>No meals mathced your search term. Please try again.</h4>
      </section>
    );
  }

  return (
    <section className="section-center">
      {meals.map((meal) => {
        const { idMeal, strMeal: title, strMealThumb: image } = meal;
        return (
          <article key={idMeal} className="single-meal">
            <img
              src={image}
              className="img"
              alt="meal"
              onClick={() => selectMeal(idMeal)}
            />
            <footer>
              <h5>{title}</h5>
              <button className="like-btn" onClick={() => addFavorites(idMeal)}>
                <BsHandThumbsUp />
              </button>
            </footer>
          </article>
        );
      })}
    </section>
  );
}
