import { useState } from "react";
import { useGlobalContext } from "../context/AppContext";

export default function Search() {
  const { setSearchTerm, fetchRandomMeal } = useGlobalContext();
  const [text, setText] = useState("");

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text) {
      setSearchTerm(text);
    }
  };

  const handleRandomMeal = () => {
    setSearchTerm("");
    setText("");
    fetchRandomMeal();
  };

  return (
    <header className="search-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="type favorite meal"
          value={text}
          onChange={handleChange}
          className="form-input"
        />
        <button type="submit" className="btn">
          search
        </button>
        <button
          className="btn btn-hipster"
          type="button"
          onClick={handleRandomMeal}
        >
          surprise me!
        </button>
      </form>
    </header>
  );
}
