import styles from "./imageForm.module.css";
import { useEffect, useRef } from "react";

export const ImageForm = ({
  updateIntent, 
  albumName, 
  onAdd, 
  onUpdate, 
  loading, 
}) => {
  // Refs for input fields
  const imageTitleRef = useRef();
  const imageUrlRef = useRef();

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const title = imageTitleRef.current.value.trim();
    const url = imageUrlRef.current.value.trim();

    if (!title || !url) return; // Prevent submitting empty values

    if (updateIntent) {
      onUpdate({ title, url }); // Call update function if editing
    } else {
      onAdd({ title, url }); // Call add function for a new image
    }

    handleClear(); // Clear input fields after submission
  };

  // Clear input fields
  const handleClear = () => {
    if (imageTitleRef.current) imageTitleRef.current.value = "";
    if (imageUrlRef.current) imageUrlRef.current.value = "";
  };

  // Prefill input fields when updating an existing image
  useEffect(() => {
    if (updateIntent) {
      imageTitleRef.current.value = updateIntent.title;
      imageUrlRef.current.value = updateIntent.url;
    }
  }, [updateIntent]);

  return (
    <div className={styles.imageForm}>
      <span>
        {updateIntent
          ? `Update Image: ${updateIntent.title}`
          : `Add Image to ${albumName}`}
      </span>

      <form onSubmit={handleSubmit}>
        <input
          required
          placeholder="Image Title"
          ref={imageTitleRef}
        />
        <input
          required
          placeholder="Image URL"
          ref={imageUrlRef}
        />
        <div className={styles.actions}>
          <button type="button" onClick={handleClear} disabled={loading}>
            Clear
          </button>
          <button type="submit" disabled={loading}>
            {updateIntent ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};
